'use strict';

/* ── 1. NEURAL CANVAS (Background Animation) ── */
const NeuralCanvas = (() => {
  let canvas, ctx, nodes, raf;
  const NODE_COUNT = 55;
  const MAX_DIST   = 130;

  function init() {
    canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    nodes = Array.from({ length: NODE_COUNT }, () => makeNode());
    window.addEventListener('resize', resize);
    loop();
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeNode() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.012;
      if (n.x < 0) n.x = canvas.width;
      if (n.x > canvas.width)  n.x = 0;
      if (n.y < 0) n.y = canvas.height;
      if (n.y > canvas.height) n.y = 0;

      const alpha = 0.35 + 0.25 * Math.sin(n.pulse);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${alpha})`;
      ctx.fill();
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const a = (1 - d / MAX_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(96,165,250,${a})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  }

  return { init, stop };
})();


/* ── 2. STDP ENGINE (Neuromorphic Logic) ── */
const STDPEngine = (() => {
  const EXCITATORY  = 'excitatory';
  const INHIBITORY  = 'inhibitory';

  let engagementScore = 0;
  let spikeHistory    = [];
  let excCount        = 0;
  let inhCount        = 0;
  let decayTimer      = null;
  let onUpdateCb      = null;

  const GRAPH_BARS = 20;
  let graphHeads   = new Array(GRAPH_BARS).fill(0);
  let graphHead    = 0;

  function onUpdate(cb) { onUpdateCb = cb; }

  function fire(intensity, type = EXCITATORY) {
    const now = Date.now();
    spikeHistory.push({ t: now, intensity, type });
    spikeHistory = spikeHistory.filter(s => now - s.t < 8000);

    if (type === EXCITATORY) excCount++;
    else inhCount++;

    let weightDelta = 0;
    for (const s of spikeHistory) {
      const age    = (now - s.t) / 8000;
      const decay  = Math.exp(-age * 3);
      const effect = s.intensity * decay;
      weightDelta += s.type === EXCITATORY ? effect : -effect * 0.6;
    }

    const target = Math.max(0, Math.min(100, Math.round(weightDelta * 22)));
    engagementScore = Math.round(engagementScore * 0.5 + target * 0.5);

    graphHeads[graphHead % GRAPH_BARS] = { type, h: Math.round(intensity * 26) };
    graphHead++;

    if (onUpdateCb) onUpdateCb({ engagementScore, excCount, inhCount, graphHeads, lastType: type });
  }

  function startDecay() {
    decayTimer = setInterval(() => {
      if (engagementScore > 0) {
        engagementScore = Math.max(0, Math.round(engagementScore * 0.87));
        if (onUpdateCb) onUpdateCb({ engagementScore, excCount, inhCount, graphHeads, lastType: null });
      }
    }, 3000);
  }

  function stopDecay() { clearInterval(decayTimer); }
  function getScore() { return engagementScore; }

  return { fire, onUpdate, startDecay, stopDecay, getScore, EXCITATORY, INHIBITORY };
})();

/* ── 3. FACE ENGINE (Emotion Detection) ── */
const FaceEngine = (() => {
  const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  const POLL_MS   = 2500; // Balanced timer

  let video;
  let isRunning    = false;
  let modelsLoaded = false;
  let onExpressionCb = null;

  async function loadModels() {
    if (modelsLoaded) return;
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      modelsLoaded = true;
    } catch (e) { console.warn('Model load failed:', e.message); }
  }

  function onExpression(cb) { onExpressionCb = cb; }

  async function start() {
    if (isRunning) return false;
    video  = document.getElementById('camVideo');

    if (!modelsLoaded) {
      UI.toast('Loading emotion models… (~3 s)');
      await loadModels();
      if (!modelsLoaded) { UI.toast('Camera models failed to load'); return false; }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 320 }, height: { ideal: 240 } }, 
        audio: false 
      });
      
      video.srcObject = stream;
      
      await new Promise(res => { 
        video.onloadedmetadata = () => { 
          video.play(); 
          // CRITICAL FIX: Explicitly set dimensions so the AI can map the face
          video.width = video.videoWidth;
          video.height = video.videoHeight;
          res(); 
        }; 
      });
      
      isRunning = true;
      scheduleNextPoll(); 
      return true;
    } catch (e) {
      UI.toast('Camera access denied');
      return false;
    }
  }

  function stop() {
    isRunning = false;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  }

  function scheduleNextPoll() {
    if (!isRunning) return;
    setTimeout(poll, POLL_MS);
  }

  async function poll() {
    if (!isRunning || !video || video.paused || video.videoWidth === 0) {
      scheduleNextPoll();
      return;
    }

    try {
      // CRITICAL FIX: Increased inputSize to 224 so the AI isn't blind
      const result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceExpressions();

      if (result) {
        const exp = result.expressions;
        const dominant = Object.entries(exp).sort((a, b) => b[1] - a[1])[0][0];

        const INHIBITORY_EXPRESSIONS = ['confused', 'sad', 'fearful', 'disgusted', 'angry'];
        const isInhibitory = INHIBITORY_EXPRESSIONS.includes(dominant);
        const spikeType    = isInhibitory ? STDPEngine.INHIBITORY : STDPEngine.EXCITATORY;
        const intensity = dominant === 'neutral' ? 0.4 : 0.75;

        if (onExpressionCb) onExpressionCb({ expression: dominant, spikeType, intensity });
      }
    } catch (e) { 
      // Silently catch errors so the loop doesn't crash
    }
    
    // Queue the next frame ONLY after this one is entirely finished
    scheduleNextPoll();
  }

  return { start, stop, onExpression };
})();
/* ── 4. TUTOR API (Gemini Integration) ── */
const TutorAPI = (() => {
  let apiKey = '';

  function buildSystem(topicLabel, depth, engScore) {
    const engNote =
      engScore < 20 ? 'Student seems disengaged — be energetic, use a hook.' :
      engScore < 45 ? 'Student has low engagement — keep it concise.' :
      engScore > 70 ? 'Student is highly engaged — go technically deeper.' :
      'Student is actively learning — match current depth.';

    return `You are NeuroLearn, an AI tutor for CSE students.
Topic: ${topicLabel}. Depth: ${depth}. Engagement: ${engScore}/100. ${engNote}
Rules: Under 160 words. Use code blocks. Be direct. End with one question.`;
  }

  async function call(messages, topicLabel, depth) {
    const engScore = STDPEngine.getScore();
    const systemText = buildSystem(topicLabel, depth, engScore);
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: geminiMessages.slice(-12),
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';
  }

  return { call };
})();


/* ── 5. UI HELPERS ── */
const UI = (() => {
  let msgId = 0, toastTimer;

  function addBubble(role, text, loading = false) {
    const id = 'msg-' + (++msgId);
    const chatArea = document.getElementById('chatArea');
    const hint = document.getElementById('emptyHint');
    if (hint) hint.remove();

    const row = document.createElement('div');
    row.className = 'msg-row ' + (role === 'user' ? 'user-row' : '');
    row.id = id;
    row.innerHTML = `
      <div class="avatar ${role === 'tutor' ? 'avatar-tutor' : 'avatar-user'}">${role === 'tutor' ? 'NL' : 'You'}</div>
      <div class="bubble ${role === 'tutor' ? 'bubble-tutor' : 'bubble-user'}${loading ? ' bubble-loading' : ''}">
        ${formatText(text)}
      </div>`;
    chatArea.appendChild(row);
    chatArea.scrollTop = chatArea.scrollHeight;
    return id;
  }

  function updateBubble(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    const bubble = el.querySelector('.bubble');
    bubble.classList.remove('bubble-loading');
    bubble.innerHTML = formatText(text);
    document.getElementById('chatArea').scrollTop = 999999;
  }

  function formatText(text) {
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => `<pre><code>${escHtml(code.trim())}</code></pre>`);
    text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${escHtml(c)}</code>`);
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return text.replace(/\n/g, '<br>');
  }

  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function updateMonitor({ engagementScore, excCount, inhCount, graphHeads }) {
    document.getElementById('engPct').textContent  = engagementScore + '%';
    const fill = document.getElementById('engFill');
    fill.style.width = engagementScore + '%';

    if (engagementScore < 20) { fill.style.background = '#3d4560'; document.getElementById('engStatus').textContent = 'no signal'; }
    else if (engagementScore < 45) { fill.style.background = '#fbbf24'; document.getElementById('engStatus').textContent = 'low engagement'; }
    else if (engagementScore < 70) { fill.style.background = '#a78bfa'; document.getElementById('engStatus').textContent = 'active learning'; }
    else { fill.style.background = '#34d399'; document.getElementById('engStatus').textContent = 'deep focus ◆'; }

    document.getElementById('excCount').textContent = excCount;
    document.getElementById('inhCount').textContent = inhCount;

    const graph = document.getElementById('spikeGraph');
    graph.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement('div');
      bar.className = 'spike-bar';
      const entry = graphHeads[i];
      if (entry && entry.h > 0) {
        bar.style.height = entry.h + 'px';
        const cls = entry.type === STDPEngine.EXCITATORY ? 'exc-active' : 'inh-active';
        bar.classList.add(cls);
        setTimeout(() => bar.classList.remove(cls), 800);
      } else { bar.style.height = '3px'; }
      graph.appendChild(bar);
    }
  }

  return { addBubble, updateBubble, toast, updateMonitor };
})();


/* ── 6. DATA CONTEXT ── */
const TOPICS = [
  { id: 'dsa', label: 'Data Structures & Algos', icon: '🌳' }, { id: 'os', label: 'Operating Systems', icon: '⚙️' },
  { id: 'dbms', label: 'DBMS & SQL', icon: '🗄️' }, { id: 'cn', label: 'Computer Networks', icon: '🌐' },
  { id: 'oops', label: 'OOP & Design Patterns', icon: '🧩' }, { id: 'se', label: 'Software Engineering', icon: '📐' },
  { id: 'co', label: 'Computer Organisation', icon: '🔌' }, { id: 'toc', label: 'Theory of Computation', icon: '∑' },
  { id: 'ml', label: 'Machine Learning', icon: '🤖' }, { id: 'web', label: 'Web Dev (HTML/CSS/JS)', icon: '🕸️' },
  { id: 'python', label: 'Python Programming', icon: '🐍' }, { id: 'cpp', label: 'C++ & STL', icon: '⚡' },
  { id: 'snn', label: 'Neuromorphic / SNNs', icon: '🧠' }, { id: 'crypto', label: 'Cryptography & Security', icon: '🔐' },
];

const SIGNAL_PROMPTS = {
  'confused': 'Student is confused. Re-explain simply under 100 words.',
  'too fast': 'Student says too fast. Break it down step-by-step under 100 words.',
  'got it, move on': 'Student understood. Introduce next logical concept.',
  'give me a code example': 'Give a practical code example.',
  'go deeper technically': 'Go deeper technically (time complexity, edge cases).',
  'give me a practice problem': 'Give one practice problem.',
};


/* ── 7. APP CONTROLLER ── */
const App = (() => {
  let currentTopic = null, convHistory = [], isLoading = false, cameraActive = false;

  function init() {
    buildTopicList();
    NeuralCanvas.init();
    STDPEngine.onUpdate(UI.updateMonitor);
    STDPEngine.startDecay();

    FaceEngine.onExpression(({ expression, spikeType, intensity }) => {
      STDPEngine.fire(intensity, spikeType);
      document.getElementById('camEmotionValue').textContent = expression;
      const isInhibitory = spikeType === STDPEngine.INHIBITORY;
      const labelEl = document.getElementById('camSpikeLabel');
      labelEl.textContent = isInhibitory ? '↓ Inhibitory spike' : '↑ Excitatory spike';
      labelEl.style.color = isInhibitory ? 'var(--red)' : 'var(--green)';

      if (isInhibitory && currentTopic && !isLoading && STDPEngine.getScore() < 35) {
        sendSignal('confused');
      }
    });

    document.getElementById('enterBtn').addEventListener('click', enterApp);
  }

  function enterApp() {
    const landing = document.getElementById('landingScreen');
    const app     = document.getElementById('appScreen');
    landing.classList.add('leaving');
    app.setAttribute('aria-hidden', 'false');
    setTimeout(() => { app.classList.add('active'); NeuralCanvas.stop(); }, 400);
    setTimeout(() => { landing.style.display = 'none'; }, 750);
  }

  function goHome() {
    const landing = document.getElementById('landingScreen');
    const app     = document.getElementById('appScreen');
    app.classList.remove('active');
    app.setAttribute('aria-hidden', 'true');
    landing.style.display = 'block';
    setTimeout(() => { landing.classList.remove('leaving'); NeuralCanvas.init(); }, 50);
  }

  function buildTopicList() {
    const list = document.getElementById('topicList');
    TOPICS.forEach(topic => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn';
      btn.id = 'tb-' + topic.id;
      btn.innerHTML = `<span class="topic-icon">${topic.icon}</span><span>${topic.label}</span>`;
      btn.addEventListener('click', () => selectTopic(topic));
      list.appendChild(btn);
    });
  }

  function selectTopic(topic) {
    if (currentTopic?.id === topic.id) return;
    currentTopic = topic;
    convHistory  = [];
    document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tb-' + topic.id).classList.add('active');
    document.getElementById('topicDisplay').textContent = topic.label;
    document.getElementById('signalsStrip').style.display = 'flex';
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('chatArea').innerHTML = '';
    STDPEngine.fire(0.9, STDPEngine.EXCITATORY);
    startSession(topic);
  }

  async function startSession(topic) {
    const depth = document.getElementById('depthSelect').value;
    document.getElementById('depthBadge').textContent = depth;
    convHistory = [{ role: 'user', content: `Start tutoring "${topic.label}" at ${depth} level.` }];
    await fetchTutor();
  }

  async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text  = input.value.trim();
    if (!text || isLoading) return;
    input.value = '';
    input.style.height = 'auto';
    STDPEngine.fire(1.0, STDPEngine.EXCITATORY);
    UI.addBubble('user', text);
    convHistory.push({ role: 'user', content: text });
    await fetchTutor();
  }

  async function sendSignal(sig) {
    if (isLoading || !currentTopic) return;
    const spikeType = (sig === 'confused' || sig === 'too fast') ? STDPEngine.INHIBITORY : STDPEngine.EXCITATORY;
    STDPEngine.fire(0.8, spikeType);
    UI.addBubble('user', sig);
    convHistory.push({ role: 'user', content: SIGNAL_PROMPTS[sig] || sig });
    await fetchTutor();
  }

  async function fetchTutor() {
    if (isLoading) return;
    isLoading = true;
    document.getElementById('sendBtn').disabled = true;
    const loadId = UI.addBubble('tutor', 'Thinking…', true);
    const depth  = document.getElementById('depthSelect').value;

    try {
      const reply = await TutorAPI.call(convHistory, currentTopic.label, depth);
      UI.updateBubble(loadId, reply);
      convHistory.push({ role: 'assistant', content: reply });
      STDPEngine.fire(0.55, STDPEngine.EXCITATORY);
    } catch (e) {
      UI.updateBubble(loadId, `⚠️ Error: ${e.message}`);
    }
    isLoading = false;
    document.getElementById('sendBtn').disabled = false;
  }

  function onDepthChange() {
    document.getElementById('depthBadge').textContent = document.getElementById('depthSelect').value;
    if (currentTopic) STDPEngine.fire(0.5, STDPEngine.EXCITATORY);
  }

  async function toggleCamera() {
    const panel = document.getElementById('cameraPanel');
    const dot   = document.getElementById('emotionDot');
    const label = document.getElementById('emotionLabel');

    if (cameraActive) {
      FaceEngine.stop();
      cameraActive = false;
      panel.style.display = 'none';
      dot.className = 'emotion-dot';
      label.textContent = 'camera off';
    } else {
      dot.className = 'emotion-dot detecting';
      label.textContent = 'starting…';
      const ok = await FaceEngine.start();
      if (ok) {
        cameraActive = true;
        panel.style.display = 'block';
        dot.className = 'emotion-dot active';
        label.textContent = 'detecting';
        UI.toast('Emotion detection active');
      } else {
        dot.className = 'emotion-dot';
        label.textContent = 'unavailable';
      }
    }
  }

  function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }
  function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }

  document.addEventListener('DOMContentLoaded', init);
  return { sendMessage, sendSignal, onDepthChange, toggleCamera, handleKey, autoResize, goHome };
})();
