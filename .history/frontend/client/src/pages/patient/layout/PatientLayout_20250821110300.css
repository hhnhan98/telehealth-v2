/* PatientLayout.css - Complete standalone styles */

/* =====================
   CSS Variables - Local Scope
===================== */
.patient-layout {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  
  /* Neutral Colors */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Semantic Colors */
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --error-700: #b91c1c;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
}

/* =====================
   Layout Container
===================== */
.patient-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--gray-50);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* =====================
   Sidebar Styles
===================== */
.patient-sidebar {
  width: 220px;
  padding: var(--spacing-lg);
  background-color: white;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-header {
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: var(--spacing-md);
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
  text-align: center;
}

.sidebar-navigation {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

/* =====================
   Menu Button Styles
===================== */
.menu-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  width: 100%;
}

.menu-button:hover {
  background-color: var(--primary-50);
  color: var(--primary-600);
  transform: translateX(4px);
}

.menu-button-active {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: white;
  box-shadow: var(--shadow-md);
}

.menu-button-active:hover {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  transform: translateX(4px);
}

.button-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.button-label {
  flex: 1;
}

.logout-button {
  margin-top: auto;
  background-color: var(--error-50);
  color: var(--error-600);
}

.logout-button:hover {
  background-color: var(--error-100);
  color: var(--error-700);
}

/* =====================
   Main Content Styles
===================== */
.patient-main {
  flex: 1;
  margin-left: 220px;
  min-height: 100vh;
  background-color: var(--gray-50);
}

.main-content {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* =====================
   Responsive Design
===================== */
@media (max-width: 1024px) {
  .patient-sidebar {
    width: 200px;
    padding: var(--spacing-md);
  }
  
  .patient-main {
    margin-left: 200px;
  }
  
  .main-content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .patient-layout {
    flex-direction: column;
  }
  
  .patient-sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    overflow-x: auto;
    padding: var(--spacing-sm);
    border-right: none;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .sidebar-header {
    display: none;
  }
  
  .sidebar-navigation {
    flex-direction: row;
    flex: 1;
    gap: var(--spacing-xs);
  }
  
  .menu-button {
    flex-direction: column;
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
    min-width: 80px;
    text-align: center;
  }
  
  .button-label {
    font-size: 0.75rem;
    line-height: 1.2;
  }
  
  .logout-button {
    min-width: 60px;
    margin-top: 0;
  }
  
  .patient-main {
    margin-left: 0;
  }
  
  .main-content {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .patient-sidebar {
    padding: var(--spacing-xs);
  }
  
  .menu-button {
    min-width: 70px;
    padding: 0.5rem;
  }
  
  .button-icon {
    font-size: 1rem;
  }
  
  .button-label {
    font-size: 0.7rem;
  }
  
  .main-content {
    padding: var(--spacing-sm);
  }
}

/* =====================
   Animations
===================== */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-button {
  animation: slideIn 0.3s ease-out;
}

.menu-button:nth-child(1) { animation-delay: 0.1s; }
.menu-button:nth-child(2) { animation-delay: 0.2s; }
.menu-button:nth-child(3) { animation-delay: 0.3s; }
.menu-button:nth-child(4) { animation-delay: 0.4s; }

/* =====================
   Focus States
===================== */
.menu-button:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* =====================
   Utility Classes
===================== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* =====================
   Print Styles
===================== */
@media print {
  .patient-sidebar {
    display: none;
  }
  
  .patient-main {
    margin-left: 0;
  }
}