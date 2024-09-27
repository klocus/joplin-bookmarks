import joplin from 'api';
import * as jsrender from 'jsrender';
import { ViewHandle, DialogResult } from '../api/types';
import Template = JsViews.Template;
import { Message } from './type/message';
import { FormData } from './type/form-data';

class JoplinBookmarks {
  private dialog: ViewHandle;
  private dialogTemplate: Template;

  private formData: FormData = {
    url: null,
    title: null,
    description: null
  };

  private tagList: { items: { id: string, title: string }[] };
  private selectedTags: string[] = [];

  constructor() {
    this.dialogTemplate = jsrender.templates(`
      <form name="bookmark">
        <p>
          <label for="url">URL</label>
          <input type="url" id="url" name="url" value="{{:formData.url}}">
        </p>
        <p>
          <label for="title">Title</label>
          <input type="text" id="title" name="title" value="{{:formData.title}}">
        </p>
        <p>
          <label for="description">Description</label>
          <textarea id="description" name="description">{{:formData.description}}</textarea>
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
    `);
  }

  public async init() {
    await this.getTagList();
    await this.openNewBookmarkDialog();
  }

  private async getTagList() {
    this.tagList = await joplin.data.get([ 'tags' ]);
  }

  private async openNewBookmarkDialog() {
    this.dialog = await joplin.views.dialogs.create('createBookmarkDialog');

    await joplin.views.dialogs.addScript(this.dialog, './asset/webview.css');
    await joplin.views.dialogs.addScript(this.dialog, './asset/webview.js');

    await joplin.views.dialogs.setHtml(this.dialog, this.dialogTemplate.render({
        formData: this.formData,
        tags: this.tagList.items,
        selectedTags: this.selectedTags
      })
    );

    await this.handleMessagesFromWebView();

    const result: DialogResult = await joplin.views.dialogs.open(this.dialog);
    console.info('Got result: ' + JSON.stringify(result));
  }

  private async handleMessagesFromWebView() {
    await joplin.views.panels.onMessage(this.dialog, async (message: Message) => {
      console.log(message);

      switch (message.type) {
        case 'INPUT_CHANGED': {
          this.formData[message.body.name] = message.body.value;
          break;
        }
        case 'TAG_SELECTED': {
          const selectedTagTitle: string = message.body;

          this.selectedTags.push(selectedTagTitle);
          this.tagList.items = this.tagList.items.filter(tag => tag.title !== selectedTagTitle)

          await joplin.views.dialogs.setHtml(this.dialog, this.dialogTemplate.render({
              formData: this.formData,
              tags: this.tagList.items,
              selectedTags: this.selectedTags
            })
          );

          this.sendMessageToWebView('RERENDER');
          break;
        }
      }
    });
  }

  private sendMessageToWebView(type: string, body?: any) {
    const message: Message = { type, body };
    joplin.views.panels.postMessage(this.dialog, message);
  }
}

joplin.plugins.register({
  onStart: async function() {
    // eslint-disable-next-line no-console
    console.info('Hello world. Test plugin started!');

    const joplinBookmarks: JoplinBookmarks = new JoplinBookmarks();
    await joplinBookmarks.init();
  },
});
