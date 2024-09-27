class BookmarkFormManager {
  static SELECTOR_FORM_INPUTS = 'input, textarea';
  static SELECTOR_TAG_LIST = '#tag-list';
  static SELECTOR_SELECTED_TAGS = '#selected-tags > li > button';

  constructor() {
    this.formInputs = [];
    this.selectedTags = [];

    this.init();
  }

  init(firstRun = true) {
    if (firstRun) {
      this.handleMessagesFromPlugin();
    }
    else {
      this.removeAllEventListeners();
    }

    this.addEventListenersToInputs();
    this.addEventListenersToSelectedTags();
  }

  handleMessagesFromPlugin() {
    // noinspection JSUnresolvedReference
    webviewApi.onMessage((event) => {
      switch (event.message.type) {
        case 'RERENDER':
          this.init(false);
          break;
      }
    });
  }

  removeAllEventListeners() {
    // form inputs
    for (let i = 0; i < this.formInputs.length; i++) {
      this.formInputs[i].removeEventListener('change', this.onInputChange);
    }

    this.formInputs = [];

    // selected tags
    for (let i = 0; i < this.selectedTags.length; i++) {
      this.selectedTags[i].removeEventListener('click', this.onTagRemove);
    }
  }

  addEventListenersToInputs() {
    this.formInputs = document.querySelectorAll(BookmarkFormManager.SELECTOR_FORM_INPUTS);

    for (let i = 0; i < this.formInputs.length; i++) {
      this.formInputs[i].addEventListener('change', this.onInputChange.bind(this));
    }
  }

  addEventListenersToSelectedTags() {
    this.selectedTags = document.querySelectorAll(BookmarkFormManager.SELECTOR_SELECTED_TAGS);

    for (let i = 0; i < this.selectedTags.length; i++) {
      this.selectedTags[i].addEventListener('click', this.onTagRemove);
    }
  }

  onInputChange(event) {
    const input = event.target;

    switch (input.name) {
      case 'url':
      case 'title':
      case 'description':
        // noinspection JSUnresolvedReference
        webviewApi.postMessage({
          type: 'INPUT_CHANGED',
          body: { name: input.name, value: input.value }
        });
        break;
      case 'tag':
        this.onTagSelect(input);
        break;
    }
  }

  onTagRemove(event) {
    const selectedTagObject = JSON.parse(event.currentTarget.dataset.value);
    // noinspection JSUnresolvedReference
    webviewApi.postMessage({
      type: 'TAG_REMOVED',
      body: selectedTagObject
    });
  }

  onTagSelect(input) {
    const selectedTagTitle = input.value;
    const selectedTagObject = JSON.parse(
      document.querySelector(`${BookmarkFormManager.SELECTOR_TAG_LIST} option[value="${selectedTagTitle}"]`).dataset.value
    );

    // noinspection JSUnresolvedReference
    webviewApi.postMessage({
      type: 'TAG_SELECTED',
      body: selectedTagObject
    });

    input.value = '';
  }
}

const formManager = new BookmarkFormManager();
