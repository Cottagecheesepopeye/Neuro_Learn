# NeuroLearn: Emotion-Aware Virtual Learning Assistant 
Made by The No-Brainers
---
## About the Project

Imagine a student spending hours studying online, struggling to understand a concept, feeling frustrated, and slowly losing motivation.

Most learning platforms track scores and progress, but they often overlook something equally important—the learner's emotional state.

**NeuroLearn** is an emotion-aware virtual learning assistant designed to make online learning more personalized, engaging, and supportive. 
Unlike traditional learning platforms that treat every student the same, NeuroLearn recognizes that emotions play a major role in the learning process.

The project aims to create a learning environment that can adapt to a student's needs by responding to signs of confusion, frustration, stress, or motivation, ultimately improving the overall learning experience.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&style=flat-flat)](https://vercel.com)
[![Inference Engine](https://img.shields.io/badge/Inference-Groq--Llama--3.3--70B-orange?logo=groq)](https://groq.com)
[![Core Core](https://img.shields.io/badge/Core-Vanilla%20JS%20%26%20STDP%20Engine-blueviolet)]()

---
##  Step-by-Step Installation & Local Setup

Bring the project up in your local environment within 60 seconds:

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/Cottagecheesepopeye/Neuro_Learn.git](https://github.com/Cottagecheesepopeye/Neuro_Learn.git)
   cd Neuro_Learn
Bring the project up in your local environment within 60 seconds:

2. Add Environment Credentials to Vercel Dashboard:
   If you are redeploying to your own cloud instance, simply add the following environment variable token into your Vercel Project panel:

   Key: GROQ_API_KEY

   Value: gsk_your_private_groq_key_here

3. Launch the Live Environment Locally:
   Open the codebase via your local text editor environment (e.g., VS Code) and host via a standard static loop tool like Live Server.

4. Local Testing Override Key:
   To verify operations on a local machine loop (localhost) without accessing live global tokens, simply hit F12 on your screen and run this      command inside your browser console window:

localStorage.setItem('NL_GROQ_KEY', 'gsk_YOUR_ACTUAL_GROQ_KEY_HERE');
     ```
   * Perform a **Hard Refresh (Ctrl + F5 / Cmd + Shift + R)**. Click "Start Learning", pick a subject, and watch the Llama 3.3 engine stream responses at blazing speed!
---

## The Problem We Are Solving

Many students face challenges while learning online:

* They often feel confused but hesitate to ask for help.
* Lack of motivation can reduce learning effectiveness.
* Existing learning platforms usually provide the same content to all learners regardless of their emotional state.
* Students may experience stress, anxiety, or frustration during studies without receiving timely support.

As a result, learning can become less engaging, less interactive, and less effective.

---

## Our Solution

NeuroLearn acts as an intelligent study companion that adapts its support based on a learner's engagement, understanding, and emotional state.

The platform continuously interacts with learners and responds to their learning behavior. Based on the learner's needs, NeuroLearn provides personalized guidance, adaptive explanations, and encouragement to make studying more effective and enjoyable.

---

### Example Scenarios

* If a learner appears confused, NeuroLearn provides simpler explanations and additional examples.
* If a learner feels frustrated, the system offers encouragement and step-by-step guidance.
* If a learner is performing well, NeuroLearn suggests more advanced challenges and learning opportunities.

This creates a more engaging, personalized, and learner-friendly educational experience.

---

## Key Features

### Emotion-Aware Learning

The platform is designed to recognize learner engagement and emotional cues to provide more personalized support.

### Personalized Learning Support

Learning recommendations and explanations can be adapted according to the learner's needs and progress.

### Interactive Virtual Assistant

Learners can interact with the platform and receive guidance similar to a virtual tutor.

### Motivation and Encouragement

The system promotes positive reinforcement to help learners stay focused and confident.

### Progress-Oriented Learning

NeuroLearn encourages continuous improvement by helping learners identify areas that need additional attention.

---

## How It Works

1. The learner interacts with the platform.
2. The system analyzes learning inputs, responses, and engagement patterns.
3. Adaptive learning logic determines the most suitable type of support.
4. NeuroLearn generates personalized feedback and learning recommendations.
5. The learner receives guidance tailored to their current learning needs.

---

## Technology Stack

### Frontend

* HTML
* CSS
* JavaScript
* Groq API hosting Llama 3.3 70B-parameter model
* WebGL accelerated `face-api.js` fetching localized model bin weights directly from browser cache.

---

### Planned Technologies

* Python integration for a smoother and accurate face detection
* SQLite / CSV
* Emotion Analysis Models
* Personalized Recommendation Engine
* More subjects

---

### File Description

* **index.html** – Main structure and layout of the application.
* **`api/tutor.js`** – Secure cloud-side script. Acts as a gatekeeper to hold private environment infrastructure tokens (`GROQ_API_KEY`) safely away from public repository scanners while acting as a high-speed runtime proxy.
* **styles.css** – Styling, visual design, and animations.
* **app.js** – Application logic and user interactions.
  * `NeuralCanvas`: Generates custom asynchronous generative background node animations.
  * `STDPEngine`: Computes real-time synaptic weight formulas and decay constants.
  * `FaceEngine`: Hand-throttled polling scheduler managing frame calculations without generating heavy rate-limit faults.
  * `TutorAPI`: Handles state serialization and protocol translation layers.

---

## Neuromorphic Inspiration

NeuroLearn is inspired by concepts from neuromorphic computing and brain-inspired learning systems.

The project follows principles such as:

* Event-driven interactions
* Adaptive responses
* Personalized learning experiences
* Dynamic adjustment based on learner behavior

Rather than treating every learner identically, NeuroLearn aims to create a learning experience that adapts and evolves according to individual needs.

---

## Expected Impact

NeuroLearn aims to:

* Improve learner engagement.
* Enhance learning effectiveness.
* Reduce frustration during studies.
* Provide a more supportive digital learning environment.
* Promote personalized education experiences.

---

## Future Scope

Future enhancements may include:

* Voice-based interaction
* Multi-language support
* Learning analytics dashboard
* Personalized study planning
* Integration with online education platforms

---

## Team

Developed as a collaborative hackathon project with the vision of making learning more personalized, inclusive, and emotionally intelligent.
---

## Conclusion

NeuroLearn is more than just a virtual tutor. It is a learning companion designed to understand, adapt, and grow with the learner—making education smarter, more engaging, and more human.

We believe the future of education should be both intelligent and empathetic, and NeuroLearn is a step in that direction.
<img width="1917" height="1090" alt="Screenshot 2026-06-14 140521" src="https://github.com/user-attachments/assets/edd1ce3d-c0ac-42e1-b400-48eac769028f" />
<img width="1918" height="1087" alt="Screenshot 2026-06-14 140440" src="https://github.com/user-attachments/assets/1847a74d-38e0-46d0-9753-8ae28b36dd15" />
<img width="1915" height="1085" alt="Screenshot 2026-06-14 140423" src="https://github.com/user-attachments/assets/08898196-2944-4ee8-98c9-c0cc37f32f56" />
<img width="1918" height="1086" alt="Screenshot 2026-06-14 140309" src="https://github.com/user-attachments/assets/b985b765-e500-471a-aa00-5e0f0b157d72" />
<img width="1917" height="1081" alt="Screenshot 2026-06-14 140229" src="https://github.com/user-attachments/assets/874ac2d2-2d25-4a43-9edf-a312dc6e7e34" />
<img width="1918" height="1090" alt="Screenshot 2026-06-14 140648" src="https://github.com/user-attachments/assets/8801d449-c126-432c-aad4-bf476dafab81" />
<img width="1918" height="1091" alt="Screenshot 2026-06-14 140558" src="https://github.com/user-attachments/assets/0db37c5c-de06-4e52-b09a-c022ebd12125" />

