import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

class XIVSettings {
  privateKey: string = "";
}

export default class MyPlugin extends Plugin {
  settings: XIVSettings
	onInit() {

	}

	async onload() {
    console.log('loading XIV plugin');
    this.settings = (await this.loadData()) || new XIVSettings()
//		  this.addRibbonIcon('dice', 'XIV Plugin', () => {
//			    new Notice('This is a xiv notice!');
		  //});

		  this.addStatusBarItem().setText('Status XIV');

		  this.addCommand({
			    id: 'open-xiv-modal',
			    name: 'Open XIV Modal',
			    checkCallback: (checking: boolean) => {
				      let leaf = this.app.workspace.activeLeaf;
				      if (leaf) {
					        if (!checking) {
						          new SampleModal(this.app).open();
					        }
					        return true;
				      }
				      return false;
			    }
		  });
      this.addCommand({
          id: "Xiv-parse-lodestone-link",
          name: "Parse XIV Lodestone link into character data",
          callback: () => this.xivCharLodestoneParse(null, null),
          hotkeys: [
              {
                  modifiers: ["Alt"],
                  key: "x",
              },
          ],
      });

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
		console.log('unloading plugin');
	}

  getSelectedText(editor: any) {
    if (editor.somethingSelected()) {
      let cursorStart = editor.getCursor(true);
      let cursorEnd = editor.getCursor(false);
      let content = editor.getRange(
        { line: cursorStart.line, ch: 0 },
        { line: cursorEnd.line, ch: editor.getLine(cursorEnd.line).length }
      );

      return {
        start: { line: cursorStart.line, ch: 0 },
        end: {
          line: cursorEnd.line,
          ch: editor.getLine(cursorEnd.line).length, 
        },
        content: content,
      };
    } else {
      var lineNr = editor.getCursor().line;
      var contents = editor.getDoc().getLine(lineNr);
      let cursorStart = {
        line: lineNr,
        ch: 0,
      };
      let cursorEnd = {
        line: lineNr,
        ch: contents.length,
      };
      let content = editor.getRange(cursorStart, cursorEnd);
      return { start: cursorStart, end: cursorEnd, content: content };
    }
  }
   async xivCharLodestoneParse(re: RegExp, subst: any) {
       //const plugin: any =(this as any).plugin
       var activeLeaf: any = this.app.workspace.activeLeaf;
       var editor = activeLeaf.view.sourceMode.cmEditor;
       var selection = editor.somethingSelected();
       var selectedText = this.getSelectedText(editor);
       var columns = "?data=FC&Columns=Character.Portrait,FreeCompany.Name";
       var pkey = "&private_key="+this.settings.privateKey;
       var apiCall = "https://xivapi.com/character/"+selectedText.content+columns+pkey;
       let image;
       let fc;
       let base = "Tags: #XIV/Character\nLinks: [Lodestone](https://eu.finalfantasyxiv.com/lodestone/character/"+selectedText.content+"/)";
       console.log(base);
       fetch(apiCall).then(response => 
           response.json().then(data => ({
               data: data,
               status: response.status
           })
                               ).then(res => {
                                   image = "![|512]("+res.data.Character.Portrait+")";
                                   fc = "FC :: [["+res.data.FreeCompany.Name+"]]";

                                   editor.replaceRange(base + "\n" + image + "\n\n" + fc, selectedText.start, selectedText.end);
                               }));
    }
}
class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	  onOpen() {
        let Name = '';
		    let {contentEl} = this;
		    contentEl.setText('Modal Test WIP');
        let setting = new Setting(contentEl).setName("Test")
            .addText((text) => text.setPlaceholder('Character Name').onChange((value) => {Name = value;}))
            .addText((text) => text.setPlaceholder('Character Server').onChange((value) => {Name = value;}))
            .addButton((button) => button.setButtonText("Search").setCta().onClick(() => console.log('it works :D')));

        let setting2 = new Setting(contentEl).setName("Test")
            .addText((text) => text.setPlaceholder('Character Name').onChange((value) => {Name = value;}))
            .addText((text) => text.setPlaceholder('Character Server').onChange((value) => {Name = value;}))
            //.addButton((button) => button.setButtonText("Search").setCta().on(() => console.log('it works :D')));

        let setting3 = new Setting(contentEl).setName("Test")
            .addButton((button) => button.setButtonText("Search").setCta().onClick(() => console.log('it works :D')));
    }

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	display(): void {
		let {containerEl} = this
    const plugin: any =(this as any).plugin

		containerEl.empty();

		containerEl.createEl('h2', {text: 'XIV helper plugin'});

		new Setting(containerEl)
			.setName('Private Key')
			.setDesc('XIVAPI Private Key')
			.addText(text => text.setPlaceholder('PrivateKey')
				.setValue(plugin.settings.privateKey)
				.onChange((value) => {
          console.log(value);
          plugin.settings.privateKey = value;
          plugin.saveData(plugin.settings);
				}));
	}
}


