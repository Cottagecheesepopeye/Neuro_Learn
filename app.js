/**
 * ============================================================
 * NeuroLearn — app.js
 * Adaptive Learning, Wired Like Your Brain.
 * ============================================================
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   1. NEURAL CANVAS (Background Animation)
════════════════════════════════════════════════════════════ */
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


/* ════════════════════════════════════════════════════════════
   2. STDP ENGINE (Neuromorphic Core)
════════════════════════════════════════════════════════════ */
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


/* ════════════════════════════════════════════════════════════
   3. FACE ENGINE (Emotion Detection)
════════════════════════════════════════════════════════════ */
const FaceEngine = (() => {
  const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  const POLL_MS   = 8000; // Throttled to preserve API rate limits

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
      // Catch silently to keep polling loop alive
    }
    
    scheduleNextPoll();
  }

  return { start, stop, onExpression };
})();


/* ════════════════════════════════════════════════════════════
   4. TUTOR API (Groq Llama 3.3 Integration)
════════════════════════════════════════════════════════════ */
const TutorAPI = (() => {
  // Looks for environmental variable fallback first to keep keys hidden on Git
  let apiKey = window.process?.env?.GROQ_API_KEY || '';

  function setKey(k) { apiKey = k; }
  function hasKey()  { return apiKey.length > 20; } 

  function buildSystem(topicLabel, depth, engScore) {
    const engNote =
      engScore < 20 ? 'Student seems disengaged — be energetic, use a hook.' :
      engScore < 45 ? 'Student has low engagement — keep it concise.' :
      engScore > 70 ? 'Student is highly engaged — go technically deeper.' :
      'Student is actively learning — match current depth.';

    return `You are NeuroLearn, an AI tutor for CSE students.
Topic: ${topicLabel}. Depth: ${depth}. Engagement: ${engScore}/100.
${engNote}
Rules: Under 160 words. Use code blocks. Be direct. End with one question.`;
  }

  async function call(messages, topicLabel, depth) {
    if (!hasKey()) throw new Error('NO_KEY');

    const engScore = STDPEngine.getScore();
    const systemText = buildSystem(topicLabel, depth, engScore);

    const formattedMessages = [
      { role: 'system', content: systemText },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages.slice(-12),
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? 'No response received.';
  }

  return { setKey, hasKey, call };
})();


/* ════════════════════════════════════════════════════════════
   5. UI HELPERS
════════════════════════════════════════════════════════════ */
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
