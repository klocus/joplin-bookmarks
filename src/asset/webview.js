let formInputs = [];
const selectedTags = [];

init();

function init() {
  addEventListenersToInputs();
  handleMessagesFromPlugin();
}

function addEventListenersToInputs() {
  removeEventListenersFromInputs();

  formInputs = document.querySelectorAll('input, textarea');

  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener('change', handleInputChange);
  }
}

function removeEventListenersFromInputs() {
  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].removeEventListener('change', handleInputChange);
  }

  formInputs = [];
}

function handleInputChange(event) {
  const input = event.target;

  switch (input.name) {
    case 'url':
    case 'title':
    case 'description':
      sendMessageAboutInputChange(input);
      break;
    case 'tags':
      sendMessageAboutSelectedTag(input);
      break;
  }
}

function sendMessageAboutInputChange(input) {
  // noinspection JSUnresolvedReference
  webviewApi.postMessage({
    type: 'INPUT_CHANGED',
    body: { name: input.name, value: input.value }
  });
}

function sendMessageAboutSelectedTag(input) {
  const selectedTag = input.value;

  if (!selectedTags.includes(selectedTag)) {
    selectedTags.push(selectedTag);
    input.value = '';

    // noinspection JSUnresolvedReference
    webviewApi.postMessage({
      type: 'TAG_SELECTED',
      body: selectedTag
    });
  }
}

function handleMessagesFromPlugin() {
  // noinspection JSUnresolvedReference
  webviewApi.onMessage((event) => {
    switch (event.message.type) {
      case 'RERENDER':
        addEventListenersToInputs();
        break;
    }
  });
}

