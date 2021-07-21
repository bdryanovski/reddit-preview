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
      border: 1px solid #aba6a6;
      width: calc(100% - 2rem);
      height: 100%;
      display: block;
      border-radius: 5px;
      background-color: rgb(228 228 228);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

      padding: 1rem;
    }

    input {
      width: 40%;
      padding: 8px 16px;
      font-weight: 500;
      border-width: 1px;
      border-radius: 2px;
      color: #3e64ff;
      border-color: #3e64ff;
    }

    button {
      box-sizing: border-box;
      margin: 0;
      overflow: visible;
      display: inline-block;
      text-align: center;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      line-height: 1.5;
      margin-bottom: 0 !important;
      margin-right: 1rem !important;
      padding: 5px 16px;
      border-width: 1px;
      border-radius: 2px;
      font-size: 14px;
      font-weight: 400;
      cursor: pointer;
      background: #3e64ff;
      border-color: #3e64ff;
      color: #fff;
    }

    button:hover {
      border-color: #fff;
    }


    .grid {
      display: grid;
      gap: 25px;
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

    .loadmore {
      display: block;
      width: 100%;
    }

    .nodata {
      color: #3e64ff;
    }
  `;

  @property({ type: String }) user = '';

  @property({ type: Number }) column = 5;

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

    return html`<img src="${data.url_overridden_by_dest}" alt="${data.title}" loading=lazy >`
  }

  loadMore() {
    this.collectData(this.user, this.next)
  }

  render() {
    return html`
      <input id="x" type="text" placeholder="${placeHolder}" .value="${this.user}" @change=${this.onChangeInput} />
      <button @click=${this.fetchData}>Fetch</button>
      <div class="grid">
        ${
          this.posts.length === 0
            ? html`<p class="nodata">Nothing to show you at the moment</p>`
            : this.posts
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

      ${ this.posts.length ? html`<center><button class="loadmore" @click=${this.loadMore}>Load more</button></center>` : ''}
     `;
  }
}
