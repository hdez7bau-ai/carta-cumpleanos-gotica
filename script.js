const lettersData = {
    1: {
        title: "Para la diseñadora de mi vida",
        body: "Mi amor: Cada trazo, cada color y cada detalle que diseñas me demuestra la hermosa creatividad que habita en tu mente. Pero lo más hermoso que has diseñado sin proponértelo es la manera en que transformas mis días ordinarios en arte puro. Gracias por ser mi compañera en esta gran película."
    },
    2: {
        title: "Sobre nuestra magia",
        body: "Desde el 4 de octubre y cada día del año, celebrar tu vida es mi mayor alegría. Adoro nuestras pláticas, nuestras risas y cómo encajamos a la perfección. Te amo con todo mi ser."
    },
    birthday: {
        title: "Para mi princesa hermosa",
        body: [
            "Para mi princesa hermosa, mi chocolatito, mi bombón, mi florecita.",
            "Feliz cumpleaños, mi niña hermosa. ❤️",
            "Quisiera poder encontrar las palabras exactas para explicarte cuánto te amo, pero siento que ni siquiera todas las palabras del mundo serían suficientes para expresar lo que significas para mí.",
            "A veces pienso en cómo comenzó nuestra historia, en aquella vez que nos quedamos tú y yo en la biblioteca porque los demás no llegaron. Ni siquiera era una cita, pero desde ese momento hubo algo especial entre nosotros, una química que nunca imaginé que terminaría convirtiéndose en estos cuatro años tan importantes de mi vida. Qué bonito es pensar que algo tan sencillo me llevaría a conocer al amor con el que hoy quiero compartirlo todo.",
            "Mi princesa, amo cada parte de ti. Tu sonrisa, tus ojos, tu cabello, tus manos y cada pequeño detalle que te hace ser tú. Me encantas de una manera que no sé explicar, porque tienes algo que nunca encontré en nadie más. Y si pudiera verte a través de mis ojos, quisiera que entendieras por qué, después de todo este tiempo, sigues fascinándome tanto y por qué mi corazón sigue sintiendo que eres tú con quien quiere estar.",
            "Gracias por estos cuatro años, mi amor. Gracias por ser parte de mi vida y por convertirte en alguien tan importante para mí. Quiero que nunca dudes de que te amo de verdad, que eres todo lo que quiero en mi vida y que, para mí, vale la pena cada esfuerzo, cada aprendizaje y cada paso que demos para seguir construyendo nuestra historia.",
            "Yo quiero todo contigo, mi bombón. Quiero seguir creciendo a tu lado, verte cumplir tus sueños, celebrar tus alegrías y acompañarte en cada etapa de tu vida. Quiero un futuro contigo, cumplir nuestros sueños y mirar atrás algún día, sintiéndome feliz de que aquella historia que comenzó en una biblioteca nos haya llevado tan lejos. No sé qué nos espera, pero sí sé que quiero descubrirlo contigo.",
            "En tu cumpleaños deseo que la vida te regale toda la felicidad que mereces, que nunca te falten motivos para sonreír y que siempre recuerdes lo maravillosa que eres. Ojalá pueda seguir acompañándote en muchos cumpleaños más, abrazarte, verte feliz y recordarte lo mucho que significas para mí.",
            "Si pudiera regresar a aquel día en la biblioteca, volvería a elegir quedarme contigo, incluso sin saber todo lo que vendría después. Porque hoy sé que aquella casualidad me permitió encontrar a una persona con la que quiero compartir mi vida entera.",
            "Feliz cumpleaños, mi florecita hermosa. Gracias por estos años y por ser tú. Te amo más de lo que a veces consigo expresar, y si hay algo que tengo claro es que quiero seguir escribiendo nuestra historia contigo.",
            "Te elegiría entonces, te elijo hoy y deseo seguir eligiéndote todos los días que la vida nos permita compartir. ❤️",
            "Con todo mi amor, de mi para ti, mi niña bonita. ❤️"
        ]
    }
};

const particlesContainer = document.getElementById("particles");
const landscapeScene = document.getElementById("landscapeScene");
const moonScene = document.getElementById("moon-scene");
const photoModal = document.getElementById("photoModal");
const letterModal = document.getElementById("letterModal");
const modalImg = document.getElementById("modalImg");
const modalCaption = document.getElementById("modalCaption");
const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastFocusedElement = null;
const lastTrailPoints = new Map();
const ambientLeaves = [];
const trailLeaves = [];
const leafColors = ["#a85d3e", "#bd7944", "#c58d55", "#8d554d"];
const trailSpacing = 30;
const ghostInterval = 30_000;
const coupleInterval = 48_000;
const maxTrailLeaves = 72;
const leafCanvas = document.createElement("canvas");
const leafContext = leafCanvas.getContext("2d", { alpha: true });
const trailCanvas = document.createElement("canvas");
const trailContext = trailCanvas.getContext("2d", { alpha: true });
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let canvasScale = 1;
let animationFrame = 0;
let previousFrameTime = 0;
let initialGhostTimer = 0;
let initialCoupleTimer = 0;
let landscapeFrame = 0;
let landscapeViewBox = "";
let landscapeMoonTransform = "";

function updateLandscapeView() {
    landscapeFrame = 0;
    const viewportRatio = window.innerWidth / Math.max(window.innerHeight, 1);
    const viewWidth = 900 * viewportRatio;
    const viewX = 720 - viewWidth / 2;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    const viewY = scrollProgress * (4000 - 900);
    const viewBox = `${viewX} ${viewY} ${viewWidth} 900`;
    const moonTransform = viewportRatio > 1.15
        ? "translate(-440 0)"
        : "translate(440 -125) scale(.55)";

    if (viewBox !== landscapeViewBox) {
        landscapeScene.setAttribute("viewBox", viewBox);
        landscapeViewBox = viewBox;
    }
    if (moonTransform !== landscapeMoonTransform) {
        moonScene.setAttribute("transform", moonTransform);
        landscapeMoonTransform = moonTransform;
    }
}

function scheduleLandscapeUpdate() {
    if (!landscapeFrame) {
        landscapeFrame = window.requestAnimationFrame(updateLandscapeView);
    }
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function addLeaf(x, y, kind) {
    const collection = kind === "ambient" ? ambientLeaves : trailLeaves;
    if (kind === "trail" && trailLeaves.length >= maxTrailLeaves) {
        trailLeaves.shift();
    }

    collection.push({
        x,
        y,
        size: kind === "ambient" ? randomBetween(9, 16) : randomBetween(13, 20),
        rotation: randomBetween(0, Math.PI * 2),
        spin: randomBetween(-1.4, 1.4),
        speed: kind === "ambient" ? randomBetween(22, 48) : randomBetween(14, 30),
        sway: kind === "ambient" ? randomBetween(9, 25) : randomBetween(12, 24),
        phase: randomBetween(0, Math.PI * 2),
        age: 0,
        lifetime: kind === "ambient" ? Infinity : randomBetween(1.05, 1.55),
        opacity: kind === "ambient" ? randomBetween(0.48, 0.72) : 0.92,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        kind
    });
}

function resizeLeafCanvas() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    canvasScale = Math.min(window.devicePixelRatio || 1, 1.75);
    leafCanvas.width = Math.round(viewportWidth * canvasScale);
    leafCanvas.height = Math.round(viewportHeight * canvasScale);
    leafCanvas.style.width = `${viewportWidth}px`;
    leafCanvas.style.height = `${viewportHeight}px`;
    leafContext.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
    trailCanvas.width = leafCanvas.width;
    trailCanvas.height = leafCanvas.height;
    trailCanvas.style.width = `${viewportWidth}px`;
    trailCanvas.style.height = `${viewportHeight}px`;
    trailContext.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
}

function drawLeaf(leaf, time, ctx) {
    const drift = Math.sin(time * 0.0018 + leaf.phase) * leaf.sway;
    const falling = leaf.kind === "ambient" ? 0 : leaf.age * 16;
    const lifeOpacity = leaf.kind === "ambient"
        ? 1
        : Math.min(1, leaf.age * 7, (leaf.lifetime - leaf.age) * 2.3);

    ctx.save();
    ctx.translate(leaf.x + drift + falling * 0.12, leaf.y + falling);
    ctx.rotate(leaf.rotation);
    ctx.scale(leaf.size, leaf.size * 0.66);
    ctx.globalAlpha = leaf.opacity * Math.max(0, lifeOpacity);
    ctx.fillStyle = leaf.color;
    ctx.strokeStyle = "rgba(255, 226, 181, 0.46)";
    ctx.lineWidth = 0.055;
    ctx.beginPath();
    ctx.moveTo(0, -0.55);
    ctx.bezierCurveTo(0.28, -0.39, 0.64, -0.72, 0.7, -0.25);
    ctx.lineTo(0.48, -0.05);
    ctx.lineTo(0.68, 0.1);
    ctx.bezierCurveTo(0.43, 0.19, 0.5, 0.57, 0.1, 0.52);
    ctx.lineTo(0, 0.78);
    ctx.lineTo(-0.08, 0.48);
    ctx.bezierCurveTo(-0.47, 0.58, -0.39, 0.19, -0.68, 0.13);
    ctx.lineTo(-0.46, -0.05);
    ctx.lineTo(-0.7, -0.27);
    ctx.bezierCurveTo(-0.61, -0.68, -0.26, -0.4, 0, -0.55);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0.63);
    ctx.lineTo(0, -0.43);
    ctx.moveTo(0, -0.05);
    ctx.lineTo(0.47, -0.31);
    ctx.moveTo(0, 0.15);
    ctx.lineTo(-0.48, -0.27);
    ctx.stroke();
    ctx.restore();
}

function animateLeaves(time) {
    if (document.hidden) {
        animationFrame = 0;
        return;
    }

    const delta = previousFrameTime ? Math.min((time - previousFrameTime) / 1000, 0.05) : 0;
    previousFrameTime = time;
    leafContext.clearRect(0, 0, viewportWidth, viewportHeight);
    trailContext.clearRect(0, 0, viewportWidth, viewportHeight);

    for (const leaf of ambientLeaves) {
        leaf.age += delta;
        leaf.y += leaf.speed * delta * (reduceMotion.matches ? 0.35 : 1);
        leaf.rotation += leaf.spin * delta * (reduceMotion.matches ? 0.35 : 1);
        if (leaf.y > viewportHeight + 30) {
            leaf.y = randomBetween(-100, -15);
            leaf.x = randomBetween(0, viewportWidth);
            leaf.phase = randomBetween(0, Math.PI * 2);
        }
        drawLeaf(leaf, time, leafContext);
    }

    for (let index = trailLeaves.length - 1; index >= 0; index -= 1) {
        const leaf = trailLeaves[index];
        leaf.age += delta;
        leaf.rotation += leaf.spin * delta;
        if (leaf.age >= leaf.lifetime) {
            trailLeaves.splice(index, 1);
            continue;
        }
        drawLeaf(leaf, time, trailContext);
    }

    animationFrame = window.requestAnimationFrame(animateLeaves);
}

function startLeafAnimation() {
    if (animationFrame || document.hidden) {
        return;
    }
    previousFrameTime = 0;
    animationFrame = window.requestAnimationFrame(animateLeaves);
}

function setupReveals() {
    const revealItems = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealItems.forEach((item) => observer.observe(item));
}

function createTrailLeaf(x, y) {
    addLeaf(x, y, "trail");
    startLeafAnimation();
}

function createGhost() {
    if (document.hidden) {
        return;
    }

    const ghost = document.createElement("span");
    ghost.className = Math.random() < 0.5 ? "ghost" : "ghost ghost--reverse";
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.setProperty("--ghost-duration", "12s");
    ghost.innerHTML = `
        <svg viewBox="0 0 90 112" focusable="false" aria-hidden="true">
            <defs>
                <linearGradient id="ghost-body" x1="0" y1="0" x2="0.8" y2="1">
                    <stop offset="0" stop-color="#fffdf7"/>
                    <stop offset="0.72" stop-color="#e5e5e8"/>
                    <stop offset="1" stop-color="#c8cbd4"/>
                </linearGradient>
            </defs>
            <path class="ghost-body" d="M8 104V43C8 22 24 6 45 6s37 16 37 37v61l-12-9-13 10-12-10-13 10-12-10z"/>
            <ellipse class="ghost-eye" cx="33" cy="51" rx="3.5" ry="5"/>
            <ellipse class="ghost-eye" cx="57" cy="51" rx="3.5" ry="5"/>
            <path class="ghost-smile" d="M39 62q6 7 12 0"/>
            <ellipse class="ghost-cheek" cx="23" cy="62" rx="5" ry="2.8"/>
            <ellipse class="ghost-cheek" cx="67" cy="62" rx="5" ry="2.8"/>
        </svg>`;
    particlesContainer.appendChild(ghost);
    ghost.addEventListener("animationend", () => ghost.remove(), { once: true });
    window.setTimeout(() => ghost.remove(), 13_000);
}

function createCoupleScene() {
    if (document.hidden || document.querySelector(".couple-scene")) {
        return;
    }

    const scene = document.createElement("div");
    scene.className = "couple-scene";
    scene.setAttribute("aria-hidden", "true");
    scene.innerHTML = `
        <svg viewBox="0 0 240 170" focusable="false">
            <g class="couple-walker couple-walker--left">
                <path class="couple-raincoat" d="M55 57Q74 48 93 58L103 112Q77 121 49 112z"/>
                <path class="couple-hood" d="M59 59Q72 48 87 58L92 68 77 77 56 67z"/>
                <g class="couple-head couple-head--left">
                    <circle class="couple-skin" cx="75" cy="39" r="14"/>
                    <path class="couple-hair couple-hair--blue" d="M61 41Q58 24 70 20L73 15 79 20Q93 22 90 42L86 52 82 48 80 38 74 43 68 38 63 49z"/>
                    <path class="couple-bangs" d="M62 34Q68 27 75 33L80 28Q87 30 89 37L83 35 79 40 73 35 68 40z"/>
                    <path class="couple-glasses" d="M62 36h10a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4zm16 0h9v7a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4zm-2 3h3"/>
                </g>
                <path class="couple-coat-seam" d="M76 71v39m-16-2h12m10 0h12"/>
                <circle class="couple-coat-button" cx="81" cy="80" r="1.4"/>
                <circle class="couple-coat-button" cx="81" cy="89" r="1.4"/>
                <g class="couple-leg couple-leg--left">
                    <path d="M61 111l-3 21m24-20 2 20"/>
                    <path class="couple-boot couple-boot--red" d="M55 130l7 1 2 8 9 3v4H53l-2-3z"/>
                    <path class="couple-boot couple-boot--red" d="M78 130l8 0 2 8 9 4v4H76l-1-4z"/>
                </g>
                <path class="couple-walk-arm couple-walk-arm--girl" d="M55 66Q44 76 48 91"/>
                <path class="couple-hug-arm couple-hug-arm--girl" d="M93 67Q111 68 119 83Q129 92 147 84"/>
            </g>
            <g class="couple-walker couple-walker--right">
                <path class="couple-hoodie" d="M142 58Q158 49 175 59L184 110Q160 118 137 111z"/>
                <path class="couple-hood-back" d="M144 60Q158 49 171 59L168 72 157 78 143 68z"/>
                <g class="couple-head couple-head--right">
                    <circle class="couple-skin" cx="158" cy="39" r="14"/>
                    <path class="couple-hair couple-hair--messy" d="M144 42L140 34 146 32 143 25 152 28 155 19 161 27 169 22 168 31 176 30 172 39 168 48 164 44 160 36 154 42 149 36z"/>
                </g>
                <path class="couple-hoodie-detail" d="M158 71v28m-7-29 7 8 7-8m-21 25h9m10 0h10"/>
                <g class="couple-shorts">
                    <path d="M139 102h42l2 19-17 2-6-12-6 12-18-2z"/>
                    <path d="M160 105v10"/>
                </g>
                <g class="couple-leg couple-leg--right">
                    <path d="M150 121l-4 15m20-15 4 15"/>
                    <path class="couple-boot couple-boot--rugged" d="M140 134h9l3 7 8 3v4h-22l-2-3z"/>
                    <path class="couple-boot couple-boot--rugged" d="M163 134h9l3 7 8 3v4h-22l-2-3z"/>
                    <path class="couple-boot-tread" d="M139 146h20m3 0h19"/>
                </g>
                <path class="couple-walk-arm couple-walk-arm--boy" d="M175 67Q188 79 182 92"/>
                <path class="couple-glove" d="M177 88q8-2 9 4l-2 8-7-1-3-5z"/>
                <path class="couple-hug-arm couple-hug-arm--boy" d="M142 67Q124 68 117 83Q108 92 94 84"/>
                <path class="couple-glove couple-glove--hug" d="M91 81q-7 0-8 5l4 6 8-2 3-5z"/>
            </g>
            <ellipse class="couple-shadow" cx="117" cy="151" rx="73" ry="5"/>
            <path class="couple-kiss-heart" d="M0-5C0-10-8-10-8-4c0 5 8 10 8 10S8 1 8-4C8-10 0-10 0-5z" transform="translate(117 17)"/>
        </svg>`;

    landscapeScene.after(scene);
        scene.addEventListener("animationend", (event) => {
            if (event.target === scene && event.animationName === "couple-journey") {
                scene.remove();
            }
        });
    window.setTimeout(() => scene.remove(), 28_000);
}

function resumeAnimations() {
    if (document.hidden) {
        return;
    }

    startLeafAnimation();
    if (!particlesContainer.querySelector(".ghost")) {
        window.clearTimeout(initialGhostTimer);
        initialGhostTimer = window.setTimeout(createGhost, 700);
    }
    if (!document.querySelector(".couple-scene")) {
        window.clearTimeout(initialCoupleTimer);
        initialCoupleTimer = window.setTimeout(createCoupleScene, 1_000);
    }
}

function showModal(modal) {
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal");
    modal.querySelector("button").focus();
}

function hideModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!photoModal.classList.contains("is-open") && !letterModal.classList.contains("is-open")) {
        document.body.classList.remove("has-modal");
    }
    if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
    }
}

function openPhoto(button) {
    modalImg.src = button.dataset.image;
    modalImg.alt = button.querySelector("img").alt;
    modalCaption.textContent = button.dataset.caption;
    showModal(photoModal);
}

function openLetter(id) {
    const letter = lettersData[id];
    if (!letter) {
        return;
    }

    const letterBody = document.getElementById("letterBody");
    const paragraphs = Array.isArray(letter.body) ? letter.body : [letter.body];
    letterBody.replaceChildren(...paragraphs.map((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        return paragraph;
    }));
    document.getElementById("letterTitle").textContent = letter.title;
    document.querySelector(".modal-letter-content").classList.toggle("is-long-letter", Array.isArray(letter.body));
    showModal(letterModal);
    wrapWords(document.getElementById("letterTitle"));
    wrapWords(letterBody);
}

function addTouchFeedback(element) {
    element.classList.add("is-touched");
    window.setTimeout(() => element.classList.remove("is-touched"), 850);
}

function wrapWords(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || !node.textContent.trim()) {
                return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest("script, style, svg, canvas, [aria-hidden='true'], .word-hover")) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach((textNode) => {
        const fragment = document.createDocumentFragment();
        const segments = textNode.textContent.split(/(\s+)/);
        segments.forEach((segment) => {
            if (!segment) {
                return;
            }
            if (/^\s+$/.test(segment)) {
                fragment.appendChild(document.createTextNode(segment));
                return;
            }
            const word = document.createElement("span");
            word.className = "word-hover";
            word.textContent = segment;
            fragment.appendChild(word);
        });
        textNode.replaceWith(fragment);
    });
}

leafCanvas.className = "leaf-canvas";
leafCanvas.setAttribute("aria-hidden", "true");
particlesContainer.appendChild(leafCanvas);
trailCanvas.className = "cursor-canvas";
trailCanvas.setAttribute("aria-hidden", "true");
document.body.appendChild(trailCanvas);
resizeLeafCanvas();
const ambientLeafCount = pointerFine.matches ? 28 : 18;
for (let index = 0; index < ambientLeafCount; index += 1) {
    addLeaf(randomBetween(0, viewportWidth), randomBetween(0, viewportHeight), "ambient");
}
startLeafAnimation();
setupReveals();
wrapWords(document.body);
document.addEventListener("pointerover", (event) => {
    const target = event.target;
    const word = target instanceof Element ? target.closest(".word-hover") : null;
    if (word) {
        word.classList.add("is-word-hovered");
    }
});
document.addEventListener("pointerout", (event) => {
    const target = event.target;
    const word = target instanceof Element ? target.closest(".word-hover") : null;
    if (word && !word.contains(event.relatedTarget)) {
        word.classList.remove("is-word-hovered");
    }
});
window.setInterval(createGhost, ghostInterval);
window.setInterval(createCoupleScene, coupleInterval);
window.addEventListener("resize", resizeLeafCanvas, { passive: true });
window.addEventListener("resize", scheduleLandscapeUpdate, { passive: true });
window.addEventListener("scroll", scheduleLandscapeUpdate, { passive: true });
scheduleLandscapeUpdate();
initialGhostTimer = window.setTimeout(createGhost, 1_200);
initialCoupleTimer = window.setTimeout(createCoupleScene, 7_000);
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        previousFrameTime = 0;
    } else {
        resumeAnimations();
    }
});
window.addEventListener("focus", resumeAnimations);
window.addEventListener("pageshow", resumeAnimations);

document.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);

    const previousPoint = lastTrailPoints.get(event.pointerId);
    const dx = previousPoint ? event.clientX - previousPoint.x : 0;
    const dy = previousPoint ? event.clientY - previousPoint.y : 0;
    const distance = Math.hypot(dx, dy);
    if (previousPoint && distance > 0) {
        const distanceToNextLeaf = trailSpacing - previousPoint.distanceSinceLeaf;
        const leavesAlongPath = Math.floor(
            (previousPoint.distanceSinceLeaf + distance) / trailSpacing
        );
        const leavesToCreate = Math.min(3, leavesAlongPath);
        for (let index = 0; index < leavesToCreate; index += 1) {
            const crossing = leavesAlongPath > leavesToCreate
                ? Math.floor(((index + 1) * leavesAlongPath) / leavesToCreate)
                : index + 1;
            const distanceAlongPath = distanceToNextLeaf + (crossing - 1) * trailSpacing;
            const progress = distanceAlongPath / distance;
            createTrailLeaf(
                previousPoint.x + dx * progress,
                previousPoint.y + dy * progress
            );
        }
        previousPoint.distanceSinceLeaf =
            (previousPoint.distanceSinceLeaf + distance) % trailSpacing;
        previousPoint.x = event.clientX;
        previousPoint.y = event.clientY;
        startLeafAnimation();
    } else if (!previousPoint) {
        lastTrailPoints.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
            distanceSinceLeaf: 0
        });
    }

    if (!pointerFine.matches) {
        return;
    }

    const target = event.target;
    const polaroid = target instanceof Element ? target.closest(".polaroid") : null;
    if (!polaroid) {
        document.querySelectorAll(".polaroid").forEach((item) => {
            item.style.removeProperty("--rotate-x");
            item.style.removeProperty("--rotate-y");
        });
        return;
    }

    const bounds = polaroid.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    polaroid.style.setProperty("--rotate-y", `${(x - 0.5) * 7}deg`);
    polaroid.style.setProperty("--rotate-x", `${(0.5 - y) * 7}deg`);
});

document.addEventListener("pointerdown", (event) => {
    lastTrailPoints.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        distanceSinceLeaf: 0
    });
    for (let index = 0; index < 5; index += 1) {
        createTrailLeaf(
            event.clientX + randomBetween(-10, 10),
            event.clientY + randomBetween(-10, 10)
        );
    }
    const target = event.target;
    const interactive = target instanceof Element ? target.closest(".polaroid, .envelope-wrapper, .final-letter-button") : null;
    if (interactive) {
        addTouchFeedback(interactive);
    }
});

document.addEventListener("pointerup", (event) => lastTrailPoints.delete(event.pointerId));
document.addEventListener("pointercancel", (event) => lastTrailPoints.delete(event.pointerId));

document.querySelectorAll(".polaroid").forEach((button) => {
    button.addEventListener("click", () => openPhoto(button));
});

document.querySelectorAll("[data-letter]").forEach((button) => {
    button.addEventListener("click", () => openLetter(button.dataset.letter));
});

document.querySelector(".close-modal").addEventListener("click", () => hideModal(photoModal));
document.querySelector(".close-letter").addEventListener("click", () => hideModal(letterModal));
photoModal.addEventListener("click", (event) => {
    if (event.target === photoModal) {
        hideModal(photoModal);
    }
});
letterModal.addEventListener("click", (event) => {
    if (event.target === letterModal) {
        hideModal(letterModal);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (photoModal.classList.contains("is-open")) {
            hideModal(photoModal);
        } else if (letterModal.classList.contains("is-open")) {
            hideModal(letterModal);
        }
    }
});
