const form = document.getElementById("passwordForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const meterFill = document.getElementById("meterFill");
const strengthLabel = document.getElementById("strengthLabel");
const suggestionsBox = document.getElementById("suggestionsBox");
const suggestionsList = document.getElementById("suggestions");

const requirementMap = {
  length8: "req-length8",
  length12: "req-length12",
  lowercase: "req-lowercase",
  uppercase: "req-uppercase",
  number: "req-number",
  special: "req-special"
};

togglePassword.addEventListener("click", () => {
  const visible = passwordInput.type === "text";
  passwordInput.type = visible ? "password" : "text";
  togglePassword.textContent = visible ? "👁️" : "🙈";
  togglePassword.setAttribute("aria-label", visible ? "Show password" : "Hide password");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const password = passwordInput.value;

  if (!password) {
    resetUI();
    return;
  }

  strengthLabel.textContent = "Checking...";

  updateUI(analyzePassword(password));
});

function analyzePassword(password) {
  const length = password.length;
  const checks = {
    length8: length >= 8,
    length12: length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  let score = Object.values(checks).filter(Boolean).length;

  const lower = password.toLowerCase();
  const commonPatterns = [
    "password", "123456", "12345678", "qwerty",
    "admin", "letmein", "welcome", "iloveyou"
  ];
  const hasCommonPattern = commonPatterns.some((pattern) => lower.includes(pattern));
  const repeated = /(.)\1{3,}/.test(password);
  const sequential = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef)/i.test(password);

  if (hasCommonPattern) score = Math.max(0, score - 2);
  if (repeated) score = Math.max(0, score - 1);
  if (sequential) score = Math.max(0, score - 1);

  let label;
  if (length === 0) label = "Empty";
  else if (score <= 2) label = "Weak";
  else if (score <= 4) label = "Medium";
  else if (score === 5) label = "Strong";
  else label = "Very Strong";

  const suggestions = [];
  if (!checks.length8) suggestions.push("Use at least 8 characters.");
  if (!checks.length12) suggestions.push("For better security, use 12+ characters.");
  if (!checks.lowercase) suggestions.push("Add lowercase letters.");
  if (!checks.uppercase) suggestions.push("Add uppercase letters.");
  if (!checks.number) suggestions.push("Add numbers.");
  if (!checks.special) suggestions.push("Add special characters.");
  if (hasCommonPattern) suggestions.push("Avoid common words or passwords.");
  if (repeated) suggestions.push("Avoid repeating the same character many times.");
  if (sequential) suggestions.push("Avoid simple sequential patterns.");

  return { score, maxScore: 6, label, checks, suggestions };
}

function updateUI(data) {
  const percentage = (data.score / data.maxScore) * 100;
  meterFill.style.width = `${percentage}%`;

  const colors = {
    Empty: "#6f7890",
    Weak: "#ff5d73",
    Medium: "#ffbd4a",
    Strong: "#35d07f",
    "Very Strong": "#48e1ff"
  };

  meterFill.style.background = colors[data.label] || "#7c5cff";
  strengthLabel.textContent = data.label;

  Object.entries(data.checks).forEach(([key, passed]) => {
    const element = document.getElementById(requirementMap[key]);
    if (!element) return;

    element.classList.toggle("valid", passed);
    element.querySelector("span").textContent = passed ? "✓" : "○";
  });

  suggestionsList.innerHTML = "";

  if (data.suggestions.length === 0) {
    suggestionsBox.classList.add("hidden");
  } else {
    data.suggestions.forEach((suggestion) => {
      const li = document.createElement("li");
      li.textContent = suggestion;
      suggestionsList.appendChild(li);
    });
    suggestionsBox.classList.remove("hidden");
  }
}

function resetUI() {
  meterFill.style.width = "0%";
  meterFill.style.background = "#7c5cff";
  strengthLabel.textContent = "—";
  suggestionsBox.classList.add("hidden");

  Object.values(requirementMap).forEach((id) => {
    const element = document.getElementById(id);
    element.classList.remove("valid");
    element.querySelector("span").textContent = "○";
  });
}