class SelectTextSearch {
  constructor() {
    this.selectedText = "";
    this.createButton();
    this.setupListeners();
  }

  createButton() {
    this.button = document.getElementById("select-search--button");

    if (!this.button) {
      this.button = document.createElement("button");
      this.button.id = "select-search--button";
      this.button.setAttribute("aria-label", "Search selected text");
      this.button.style = `
        pointer-events: auto;
        display: none;
        position: fixed;
        padding: calc(var(--ifm-button-padding-vertical) * var(--ifm-button-size-multiplier)) calc(var(--ifm-button-padding-horizontal) * var(--ifm-button-size-multiplier));
        background-color: var(--ifm-color-primary);
        color: var(--ifm-button-color);
        border: var(--ifm-button-border-width) solid var(--ifm-button-border-color);
        text-align: center;
        border-radius: var(--ifm-button-border-radius);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999999;
        box-shadow: none;
      `;
      this.button.textContent = "Pesquisar ...";
      document.body.appendChild(this.button);
    }
  }

  setupListeners() {
    document.addEventListener("mouseup", (e) => this.handleTextSelection(e));
    document.addEventListener("touchend", (e) => this.handleTextSelection(e));
    
    this.button.addEventListener("click", () => this.redirectToSearch());
    this.button.addEventListener("mouseenter", () => this.buttonHover(true));
    this.button.addEventListener("mouseleave", () => this.buttonHover(false));
  }

  handleTextSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      this.selectedText = selectedText;
      this.showButton(e);
    } else {
      this.hideButton();
    }
  }

  showButton(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    this.button.style.display = "block";
    this.button.style.left = x + 10 + "px";
    this.button.style.top = y + 10 + "px";
  }

  hideButton() {
    this.button.style.display = "none";
    this.selectedText = "";
  }

  buttonHover(isHovering) {
    if (isHovering) {
      this.button.style.transform = "scale(1.05)";
      this.button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
    } else {
      this.button.style.transform = "scale(1)";
      this.button.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
    }
  }

  redirectToSearch() {
    if (this.selectedText.length > 0) {
      const encodedText = encodeURIComponent(this.selectedText);
      window.location.href = `/garden/search?q=${encodedText}`;
    }
  }
}

new SelectTextSearch();
