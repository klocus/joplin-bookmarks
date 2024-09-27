class BookmarkFormManager {
  constructor() {
    this.formInputs = [];
    this.selectedTags = [];

    this.addEventListenersToInputs();
    this.handleMessagesFromPlugin();
  }

  addEventListenersToInputs() {
    this.removeEventListenersFromInputs();

    this.formInputs = document.querySelectorAll('input, textarea');

    for (let i = 0; i < this.formInputs.length; i++) {
      this.formInputs[i].addEventListener('change', this.handleInputChange.bind(this));
    }
  }

  removeEventListenersFromInputs() {
    for (let i = 0; i < this.formInputs.length; i++) {
      this.formInputs[i].removeEventListener('change', this.handleInputChange);
    }

    this.formInputs = [];
  }

  handleInputChange(event) {
    const input = event.target;

    switch (input.name) {
      case 'url':
      case 'title':
      case 'description':
        this.sendMessageAboutInputChange(input);
        break;
      case 'tags':
        this.sendMessageAboutSelectedTag(input);
        break;
    }
  }

  sendMessageAboutInputChange(input) {
    // noinspection JSUnresolvedReference
    webviewApi.postMessage({
      type: 'INPUT_CHANGED',
      body: { name: input.name, value: input.value }
    });
  }

  sendMessageAboutSelectedTag(input) {
    const selectedTag = input.value;

    if (!this.selectedTags.includes(selectedTag)) {
      this.selectedTags.push(selectedTag);
      input.value = '';

      // noinspection JSUnresolvedReference
      webviewApi.postMessage({
        type: 'TAG_SELECTED',
        body: selectedTag
      });
    }
  }

  handleMessagesFromPlugin() {
    // noinspection JSUnresolvedReference
    webviewApi.onMessage((event) => {
      switch (event.message.type) {
        case 'RERENDER':
          this.addEventListenersToInputs();
          break;
      }
    });
  }
}

const formManager = new BookmarkFormManager();
