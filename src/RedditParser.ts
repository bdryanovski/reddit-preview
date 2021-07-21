/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-extend-native */
/* eslint-disable no-plusplus */
import { html, css, LitElement, property, svg } from 'lit-element';

import redditFetch from './reddit-fetch.js';

const placeHolder = 'user/boobflips'

Object.defineProperty(Array.prototype, 'chunk', {
  value (chunkSize: number = 1) {
    const temporal = new Array(chunkSize).fill(null).map(() => []);
    let pos = 0;
    for (let i = 0; i < this.length; i++) {
      // @ts-ignore
      temporal[pos].push(this[i])
      // @ts-ignore
      pos >= (chunkSize - 1) ? (pos = 0) : pos++;
    }
    return temporal;
  }
});

export class RedditParser extends LitElement {
  static styles = css`
    :host {
      font-family: Arial, sans-serif;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 10px rgba(0, 0, 0, 0.2);
      width: 100%;
      overflow: hidden;
      display: flex;
    }

    * {
      box-sizing: border-box;
    }

    .controls {
      background-color: #2A265F;
      color: #fff;
      padding: 30px;
      max-width: 350px;
    }
    .controls h3 {
      opacity: 0.6;
      margin: 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .controls p {
      opacity: 0.4;
      letter-spacing: 1px;
      white-space: pre-wrap;
    }

    .preview {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-content: space-around
    }

    input {
      width: auto;
      padding: 8px 16px;
      font-weight: 500;
      border-width: 1px;
      border-radius: 2px;
      color: #2A265F;
      border-color: #2A265F;
    }

    button {
      display: inline-block;
      text-align: center;
      border: 1px solid transparent;
      padding: 5px 16px;
      border-width: 1px;
      border-radius: 2px;
      font-size: 14px;
      cursor: pointer;
      background: #2A265F;
      border-color: #fff;
      color: #fff;
    }
    .preview button {
      width: 200px;
      margin: 15px auto;
    }

    .form {
      display: inline-flex;
      flex-wrap: nowrap;
      gap: 15px;
    }

    .grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      margin: 0 auto 80px;
      max-width: 100vw;
      padding: 1rem;
    }

    .grid .item .link img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .grid .item .link:nth-child(2) {
      grid-column: auto / span 2;
    }

    .grid .item .link:nth-child(3) {
      grid-column: auto / span 2;
      grid-row: auto / span 2;
    }

    .nodata {
      color: #2A265F;
      letter-spacing: 1px;
      margin: 1rem;
    }
  `;

  @property({ type: String }) user = '';

  posts: any = [];

  next?: string;

  onChangeInput(e: any) {
    if (e.target.value !== this.user) {
      this.posts = [];
    }
    this.collectData(e.target.value);
    this.user = e.target.value;
  }

  fetchData() {
    this.collectData(this.user)
  }

  collectData(target: string, nextPage?: string) {
    redditFetch({
      subreddit: target,
      sort: 'hot',
      nextPage: nextPage || undefined
    }).then((data: any) => {
      this.posts = [...this.posts, ...data.children];
      this.next = data.after;
      this.requestUpdate();
    }).catch(() => {
      // do nothing
    });
  }

  embed(data: any): any {
    if (data.media && data.media.type === 'redgifs.com') {
      return html`<div style='position:relative; padding-bottom:73.39%;)'>
        <iframe src='${data.secure_media_embed.media_domain_url}'
          title="${data.title}"
          frameborder='0'
          scrolling='no'
          width='100%'
          height='100%'
          style='position:absolute;top:0;left:0;' allowfullscreen>
        </iframe></div>
        `
    }

    return html`<img src="${data.url_overridden_by_dest}" alt="${data.title}" loading="lazy" >`
  }

  loadMore() {
    this.collectData(this.user, this.next)
  }

  renderPreview() {
    if (this.posts.length === 0) {
      return html`<h2 class="nodata">Nothing to show at the moment, try to fetch it ...</h2>`
    }

    return html`
      <div class="grid">
        ${this.posts
        .filter((post: any): any => post.data.url)
        .map((post: any) => html`
          <div class="item">
            <a class="link" href=${post.data.url} target="_blank">
              ${this.embed(post.data)}
            </a>
          </div>`
        )
      }
      </div>
      <button @click=${this.loadMore}>Load more</button>
    `;
  }

  render() {
    return html`
      <div class="controls">
        <h3>Reddit:</h3>
        <div class="form">
          <input id="reddit" type="text" placeholder="${placeHolder}" .value="${this.user}" @change=${this.onChangeInput} />
          <button @click=${this.fetchData}>Fetch</button>
        </div>
        <p>
          Try to fetch and display images from Reddit, why don't you try typing r/meme and check it for yourself.
        </p>
      </div>

      <div class="preview">
        ${
          this.renderPreview()
        }
      </div>
     `;
  }
}
