function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const target = document.getElementById('screen-' + screenId);
    if (target) {
        // Hide nav on pitch screen
        const nav = document.querySelector('.bottom-nav');
        if (screenId === 'pitch') {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'flex';
        }

        target.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Update nav state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (screenId === 'home' && item.innerText.includes('홈')) item.classList.add('active');
        if (screenId === 'community' && item.innerText.includes('커뮤니티')) item.classList.add('active');
    });
}

function initPredictionGraph() {
    const container = document.getElementById('golf-prediction');
    if (!container) return;

    container.innerHTML = '';
    const scores = [85, 88, 82, 60, 55, 70, 75, 80];
    const hours = ['09', '11', '13', '15', '17', '19', '21', '23'];

    scores.forEach((score, index) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;';
        
        const barContainer = document.createElement('div');
        barContainer.style.cssText = 'width: 100%; height: 80px; background: #F2F4F6; border-radius: 8px; position: relative; overflow: hidden;';

        const bar = document.createElement('div');
        bar.style.cssText = `
            position: absolute; bottom: 0; width: 100%; 
            background: ${score > 80 ? 'var(--oai-optimal)' : 'var(--primary)'};
            transition: height 1s cubic-bezier(0.16, 1, 0.3, 1);
            height: 0%;
        `;
        
        const label = document.createElement('div');
        label.style.cssText = 'font-size: 11px; color: var(--text-tertiary); font-weight: 600;';
        label.innerText = hours[index];

        barContainer.appendChild(bar);
        wrap.appendChild(barContainer);
        wrap.appendChild(label);
        container.appendChild(wrap);

        setTimeout(() => {
            bar.style.height = score + '%';
        }, index * 50);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial start
    showScreen('pitch');
});

// Override showScreen for detailed effects
const baseShowScreen = showScreen;
window.showScreen = function(screenId) {
    if (screenId.startsWith('detail')) {
        // "Analyzing" effect for pitch
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index:2000; display:flex; flex-direction:column; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div style="width: 40px; height: 40px; border: 4px solid #F2F4F6; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 24px; font-weight: 700; color: #191F28; font-size: 17px;">조건 분석 중...</p>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                overlay.remove();
                baseShowScreen(screenId);
                if (screenId === 'detail-golf') initPredictionGraph();
            }, 300);
        }, 800);
    } else {
        baseShowScreen(screenId);
    }
};

// CSS Spin
const style = document.createElement('style');
style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
