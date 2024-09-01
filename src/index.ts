import joplin from 'api';
import * as jsrender from 'jsrender';
import { ViewHandle } from '../api/types';

async function createNewBookmark() {
  const tagList: { items: { id: string, title: string }[] } = await joplin.data.get([ 'tags' ]);
  const handle: ViewHandle = await joplin.views.dialogs.create('createBookmarkDialog');

  await joplin.views.dialogs.addScript(handle, './asset/webview.css');
  await joplin.views.dialogs.addScript(handle, './asset/webview.js');

  await joplin.views.dialogs.setHtml(handle, jsrender.templates(`
  <form name="bookmark">
    <p>
      <label for="url">URL</label>
      <input type="url" id="url" name="url">
    </p>
    <p>
      <label for="title">Title</label>
      <input type="text" id="title" name="title">
    </p>
    <p>
      <label for="description">Description</label>
      <textarea id="description" name="description"></textarea>
    </p>
    <p>
      <label for="tags">Tags</label>
      <input list="tag-list" id="tags" name="tags">
      <datalist id="tag-list">
        {{for tags}}
          <option value="{{:title}}"></option>
        {{/for}}
      </datalist>
    </p>
    <p>
      {{for selectedTags}}
        {{:title}},
      {{/for}}
    </p>
  </form>
`).render({ tags: tagList.items }));

  await joplin.views.panels.onMessage(handle, async (msg) => {
    console.log(msg);
  });

  const result = await joplin.views.dialogs.open(handle);

  console.info('Got result: ' + JSON.stringify(result));
}

joplin.plugins.register({
	onStart: async function() {
		// eslint-disable-next-line no-console
		console.info('Hello world. Test plugin started!');

    await createNewBookmark();
	},
});
