/**
 * ==============================================================================
 * FinanZen - Funcionalidades Interactivas (Calculadoras, UX y Consentimiento)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Menú móvil responsive
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // 2. Banner de Cookies (Cumplimiento RGPD / ePrivacy / AdSense)
  initCookieBanner();

  // 3. Inicializar Calculadoras si existen en la página
  initCompoundInterestCalc();
  initBudget503020Calc();
  initLoanCalc();

  // 4. Barra de lectura y componentes UI
  initReadingProgressBar();
  initFAQAccordion();
  initFinancialQuiz();
  initNewsletterForm();
});

/* ==============================================================================
   Gestión de Consentimiento de Cookies
   ============================================================================== */
function initCookieBanner() {
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  if (!cookieBanner) return;

  const cookieConsent = localStorage.getItem('finanzen_cookie_consent');
  if (!cookieConsent) {
    cookieBanner.style.display = 'block';
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('finanzen_cookie_consent', 'accepted');
      cookieBanner.style.display = 'none';
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('finanzen_cookie_consent', 'declined');
      cookieBanner.style.display = 'none';
    });
  }
}

/* ==============================================================================
   Calculadora de Interés Compuesto
   ============================================================================== */
function initCompoundInterestCalc() {
  const calcForm = document.getElementById('compound-calc-form');
  if (!calcForm) return;

  const initialEl = document.getElementById('calc-initial');
  const monthlyEl = document.getElementById('calc-monthly');
  const rateEl = document.getElementById('calc-rate');
  const yearsEl = document.getElementById('calc-years');

  const totalValueEl = document.getElementById('res-total');
  const totalInvestedEl = document.getElementById('res-invested');
  const totalInterestEl = document.getElementById('res-interest');
  const chartCanvas = document.getElementById('compound-chart');

  function calculate() {
    const P = parseFloat(initialEl.value) || 0;
    const PMT = parseFloat(monthlyEl.value) || 0;
    const annualRate = (parseFloat(rateEl.value) || 0) / 100;
    const years = parseInt(yearsEl.value) || 1;
    const r = annualRate / 12; // Tasa mensual
    const months = years * 12;

    let balance = P;
    let totalInvested = P;

    const yearlyData = [];
    yearlyData.push({ year: 0, invested: P, balance: P });

    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + r) + PMT;
      totalInvested += PMT;

      if (m % 12 === 0) {
        yearlyData.push({
          year: m / 12,
          invested: Math.round(totalInvested),
          balance: Math.round(balance)
        });
      }
    }

    const totalInterest = balance - totalInvested;

    // Formatear resultados en Euros o formato estándar de moneda
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });

    if (totalValueEl) totalValueEl.textContent = formatter.format(Math.round(balance));
    if (totalInvestedEl) totalInvestedEl.textContent = formatter.format(Math.round(totalInvested));
    if (totalInterestEl) totalInterestEl.textContent = formatter.format(Math.round(totalInterest));

    // Renderizar gráfico simple en Canvas si está disponible
    if (chartCanvas) {
      drawGrowthChart(chartCanvas, yearlyData);
    }
  }

  calcForm.addEventListener('input', calculate);
  calculate(); // Cálculo inicial
}

function drawGrowthChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width = canvas.parentElement.clientWidth || 500;
  const height = canvas.height = 220;
  ctx.clearRect(0, 0, width, height);

  const maxVal = Math.max(...data.map(d => d.balance)) || 1;
  const paddingBottom = 25;
  const paddingTop = 20;
  const chartHeight = height - paddingBottom - paddingTop;
  const stepX = (width - 40) / (data.length - 1 || 1);

  // Dibujar curva de Inversión Total (Capital aportado)
  ctx.beginPath();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  data.forEach((d, i) => {
    const x = 20 + i * stepX;
    const y = height - paddingBottom - (d.invested / maxVal) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dibujar curva de Saldo Final (Con Interés Compuesto)
  ctx.beginPath();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  data.forEach((d, i) => {
    const x = 20 + i * stepX;
    const y = height - paddingBottom - (d.balance / maxVal) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Texto de referencia
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Año 0', 10, height - 8);
  ctx.fillText(`Año ${data[data.length - 1].year}`, width - 45, height - 8);
}

/* ==============================================================================
   Calculadora Regla 50 / 30 / 20
   ============================================================================== */
function initBudget503020Calc() {
  const form = document.getElementById('budget-calc-form');
  if (!form) return;

  const incomeInput = document.getElementById('budget-income');
  const needsEl = document.getElementById('budget-needs');
  const wantsEl = document.getElementById('budget-wants');
  const savingsEl = document.getElementById('budget-savings');

  function updateBudget() {
    const income = parseFloat(incomeInput.value) || 0;
    const needs = income * 0.50;
    const wants = income * 0.30;
    const savings = income * 0.20;

    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });

    if (needsEl) needsEl.textContent = formatter.format(needs);
    if (wantsEl) wantsEl.textContent = formatter.format(wants);
    if (savingsEl) savingsEl.textContent = formatter.format(savings);
  }

  form.addEventListener('input', updateBudget);
  updateBudget();
}

/* ==============================================================================
   Calculadora de Cuota de Préstamo / Hipoteca
   ============================================================================== */
function initLoanCalc() {
  const form = document.getElementById('loan-calc-form');
  if (!form) return;

  const amountInput = document.getElementById('loan-amount');
  const interestInput = document.getElementById('loan-rate');
  const termInput = document.getElementById('loan-years');
  const monthlyPaymentEl = document.getElementById('loan-monthly-payment');
  const totalRepaidEl = document.getElementById('loan-total-repaid');

  function calculateLoan() {
    const amount = parseFloat(amountInput.value) || 0;
    const annualRate = (parseFloat(interestInput.value) || 0) / 100;
    const years = parseInt(termInput.value) || 1;

    const monthlyRate = annualRate / 12;
    const numPayments = years * 12;

    let monthly = 0;
    if (monthlyRate === 0) {
      monthly = amount / numPayments;
    } else {
      monthly = (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const totalRepaid = monthly * numPayments;

    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    });

    if (monthlyPaymentEl) monthlyPaymentEl.textContent = formatter.format(monthly);
    if (totalRepaidEl) totalRepaidEl.textContent = formatter.format(totalRepaid);
  }

  form.addEventListener('input', calculateLoan);
  calculateLoan();
}

/* ==============================================================================
   Barra de Progreso de Lectura
   ============================================================================== */
function initReadingProgressBar() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  });
}

/* ==============================================================================
   Acordeón Interactivo de Preguntas Frecuentes
   ============================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* ==============================================================================
   Test Interactivo de Salud Financiera
   ============================================================================== */
function initFinancialQuiz() {
  const quizForm = document.getElementById('financial-quiz-form');
  if (!quizForm) return;

  const scoreEl = document.getElementById('quiz-score-val');
  const msgEl = document.getElementById('quiz-score-msg');

  function evaluateQuiz() {
    let score = 0;
    const answers = quizForm.querySelectorAll('select');
    answers.forEach(sel => {
      score += parseInt(sel.value) || 0;
    });

    if (scoreEl) scoreEl.textContent = `${score} / 100`;

    if (msgEl) {
      if (score >= 80) {
        msgEl.textContent = "🏆 ¡Excelente! Tu salud financiera es robusta y tienes bases de inversión sólidas.";
        msgEl.style.color = "#059669";
      } else if (score >= 50) {
        msgEl.textContent = "⚖️ Estado Aceptable: Tienes buen control pero te beneficiarías de crear un fondo de emergencia o empezar a invertir de forma pasiva.";
        msgEl.style.color = "#d97706";
      } else {
        msgEl.textContent = "⚠️ Atención Necesaria: Se recomienda priorizar la eliminación de deudas con altos intereses y presupuestar con la regla 50/30/20.";
        msgEl.style.color = "#dc2626";
      }
    }
  }

  quizForm.addEventListener('change', evaluateQuiz);
  evaluateQuiz();
}

/* ==============================================================================
   Formulario de Boletín Informativo (Newsletter)
   ============================================================================== */
function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    if (btn && input) {
      btn.textContent = "✓ ¡Suscrito con Éxito!";
      btn.style.background = "#10b981";
      input.value = "";
      setTimeout(() => {
        btn.textContent = "Suscribirme Gratis";
        btn.style.background = "#f59e0b";
      }, 4000);
    }
  });
}

