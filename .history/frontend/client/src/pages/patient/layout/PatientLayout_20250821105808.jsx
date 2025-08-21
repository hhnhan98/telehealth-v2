/* PatientLayout.module.css */

.wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--background);
}

/* Sidebar Styles */
.sidebar {
  width: 220px;
  padding: var(--spacing-lg);
  background-color: var(--surface);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  transition: transform var(--transition-normal);
}

.sidebarHeader {
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--spacing-md);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

/* Menu Button Styles */
.menuButton {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  width: 100%;
}

.menuButton:hover {
  background-color: var(--primary-50);
  color: var(--primary-600);
  transform: translateX(4px);
}

.menuButton.active {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: white;
  box-shadow: var(--shadow-md);
}

.menuButton.active:hover {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  transform: translateX(4px);
}

.icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.label {
  flex: 1;
}

.logoutButton {
  margin-top: auto;
  background-color: var(--error-50);
  color: var(--error-600);
}

.logoutButton:hover {
  background-color: var(--error-100);
  color: var(--error-700);
}

/* Main Content Styles */
.main {
  flex: 1;
  margin-left: 220px;
  min-height: 100vh;
  background-color: var(--background);
}

.content {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
    padding: var(--spacing-md);
  }
  
  .main {
    margin-left: 200px;
  }
  
  .content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    overflow-x: auto;
    padding: var(--spacing-sm);
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }
  
  .sidebarHeader {
    display: none;
  }
  
  .navigation {
    flex-direction: row;
    flex: 1;
    gap: var(--spacing-xs);
  }
  
  .menuButton {
    flex-direction: column;
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
    min-width: 80px;
    text-align: center;
  }
  
  .menuButton .label {
    font-size: 0.75rem;
    line-height: 1.2;
  }
  
  .logoutButton {
    min-width: 60px;
    margin-top: 0;
  }
  
  .main {
    margin-left: 0;
  }
  
  .content {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .sidebar {
    padding: var(--spacing-xs);
  }
  
  .menuButton {
    min-width: 70px;
    padding: 0.5rem;
  }
  
  .icon {
    font-size: 1rem;
  }
  
  .label {
    font-size: 0.7rem;
  }
  
  .content {
    padding: var(--spacing-sm);
  }
}

/* Animation for sidebar items */
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

.menuButton {
  animation: slideIn 0.3s ease-out;
}

.menuButton:nth-child(1) { animation-delay: 0.1s; }
.menuButton:nth-child(2) { animation-delay: 0.2s; }
.menuButton:nth-child(3) { animation-delay: 0.3s; }
.menuButton:nth-child(4) { animation-delay: 0.4s; }

/* Focus states for accessibility */
.menuButton:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .menuButton {
    border: 1px solid currentColor;
  }
  
  .menuButton.active {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .menuButton {
    transition: none;
    animation: none;
  }
  
  .menuButton:hover {
    transform: none;
  }
}