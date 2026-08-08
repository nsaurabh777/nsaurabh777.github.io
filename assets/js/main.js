const tabButtons = Array.from(document.querySelectorAll('.tab-list button'));
const panels = document.querySelectorAll('.tab-panel');

function activateTab(button) {
    const target = button.dataset.tab;

    tabButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
        btn.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
        const isActive = panel.id === target;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
    });
    button.focus();
}

tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateTab(button));

    button.addEventListener('keydown', (event) => {
        let newIndex = null;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            newIndex = (index + 1) % tabButtons.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            newIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else if (event.key === 'Home') {
            newIndex = 0;
        } else if (event.key === 'End') {
            newIndex = tabButtons.length - 1;
        }

        if (newIndex !== null) {
            event.preventDefault();
            activateTab(tabButtons[newIndex]);
        }
    });
});

document.getElementById('year').textContent = new Date().getFullYear();
