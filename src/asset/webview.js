document.addEventListener('click', event => {
  const element = event.target;
  if (element) {
    // Post the message to the plugin:
    // noinspection JSUnresolvedReference
    webviewApi.postMessage({
      name: 'scrollToHash',
      hash: '#',
    });
  }
});
