import joplin from 'api';
import * as jsrender from 'jsrender';
import { ViewHandle, DialogResult } from '../api/types';
import Template = JsViews.Template;
import { Message } from './type/message';
import { FormData } from './type/form-data';
import { TagList } from './type/tag-list';
import { Tag } from './type/tag';

class JoplinBookmarks {
  private dialog: ViewHandle;
  private dialogTemplate: Template;

  private formData: FormData = {
    url: null,
    title: null,
    description: null
  };

  private tagList: TagList;
  private selectedTags: Tag[] = [];

  constructor() {
    jsrender.views.settings.allowCode(true);

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
          <label for="tag">Tags</label>
          <input list="tag-list" id="tag" name="tag">
          <datalist id="tag-list">
            {{for tags}}
              <option data-value='{{*: JSON.stringify(data) }}' value="{{:title}}"></option>
            {{/for}}
          </datalist>
        </p>
        <ul id="selected-tags">
          {{for selectedTags}}
            <li>
              <button type="button" data-value='{{*: JSON.stringify(data) }}'>
                <span>{{:title}}</span>
                <span>&times;</span>
              </button>
            </li>
          {{/for}}
        </ul>
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
          await this.onTagSelected(message.body);
          break;
        }
        case 'TAG_REMOVED': {
          await this.onTagRemoved(message.body);
          break;
        }
      }
    });
  }

  private async onTagSelected(selectedTag: Tag) {
    this.selectedTags.push(selectedTag);
    this.tagList.items = this.tagList.items.filter(tag => tag.id !== selectedTag.id)

    await joplin.views.dialogs.setHtml(this.dialog, this.dialogTemplate.render({
        formData: this.formData,
        tags: this.tagList.items,
        selectedTags: this.selectedTags
      })
    );

    this.sendMessageToWebView('RERENDER');
  }

  private async onTagRemoved(removedTag: Tag) {
    this.selectedTags = this.selectedTags.filter(tag => tag.id !== removedTag.id);

    this.tagList.items.push(removedTag);

    await joplin.views.dialogs.setHtml(this.dialog, this.dialogTemplate.render({
        formData: this.formData,
        tags: this.tagList.items,
        selectedTags: this.selectedTags
      })
    );

    this.sendMessageToWebView('RERENDER');
  }

  private sendMessageToWebView(type: string, body?: any) {
    const message: Message = { type, body };
    joplin.views.panels.postMessage(this.dialog, message);
  }
}

joplin.plugins.register({
  onStart: async function() {
    console.info('Joplin Bookmarks started!');

    const joplinBookmarks: JoplinBookmarks = new JoplinBookmarks();
    await joplinBookmarks.init();
  },
});
