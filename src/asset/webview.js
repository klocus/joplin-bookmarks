const selectedTags = [];

addEventListenersToFormInputs();

// noinspection JSUnresolvedReference
webviewApi.onMessage((message) => {
  console.log('MESSAGE', message);

  switch (message.type) {
    case 'RENDER':
      addEventListenersToFormInputs();
      break;
  }
});

// @TODO: Events are not working after HTML re-render
function addEventListenersToFormInputs() {
  const formInputs = document.querySelectorAll('input, textarea');

  for (let i = 0; i < formInputs.length; i++) {
    //@TODO: Remove event listener after re-render
    formInputs[i].addEventListener('change', handleInputChange);
  }
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

document.addEventListener('click', event => {
  const element = event.target;
  if (element) {
    webviewApi.postMessage({
      type: 'scrollToHash',
      body: 'test'
    });
  }
})
