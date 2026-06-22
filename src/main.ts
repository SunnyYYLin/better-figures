import { Plugin } from 'obsidian';
import { registerFigureCaption } from './features/figure-caption';

export default class BetterFiguresPlugin extends Plugin {
	async onload() {
		registerFigureCaption(this);
	}
}
