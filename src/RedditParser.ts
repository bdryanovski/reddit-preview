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
    }

    .grid {
      display: grid;
      gap: 25px;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 325px 325px 120px;
      margin: 0 auto 80px;
      max-width: 80vw;
    }

    .gallery {
      display: flex;
      padding: 2px;
      transition: 0.3s;
    }
    .gallery:hover .gallery__image {
      filter: grayscale(1);
    }
    .gallery__column {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .gallery__link {
      margin: 2px;
      overflow: hidden;
    }
    .gallery__link:hover .gallery__image {
      filter: grayscale(0);
    }
    .gallery__link:hover .gallery__caption {
      opacity: 1;
    }
    .gallery__thumb {
      position: relative;
      margin: 0;
    }
    .gallery__image {
      display: block;
      width: 100%;
      transition: 0.3s;
    }
    .gallery__image:hover {
      transform: scale(1.1);
    }
    .gallery__caption {
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 25px 15px 15px;
      width: 100%;
      font-family: "Raleway", sans-serif;
      font-size: 16px;
      color: white;
      opacity: 0;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
      transition: 0.3s;
    }

    .loadmore {
      margin: 2rem;
    }
    .nodata {
      width: 150px;
      padding: 2rem;
      margin: 0 auto;
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

    return html`<img class="gallery__image" src="${data.url_overridden_by_dest}" alt="${data.title}" loading=lazy >`
  }

  loadMore() {
    this.collectData(this.user, this.next)
  }

  reddit() {
    return svg`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 11.889c0-.729-.596-1.323-1.329-1.323-.358 0-.681.143-.92.373-.905-.595-2.13-.975-3.485-1.023l.742-2.334 2.008.471-.003.029c0 .596.487 1.082 1.087 1.082.599 0 1.086-.485 1.086-1.082s-.488-1.082-1.087-1.082c-.46 0-.852.287-1.01.69l-2.164-.507c-.094-.023-.191.032-.22.124l-.827 2.603c-1.419.017-2.705.399-3.65 1.012-.237-.219-.552-.356-.9-.356-.732.001-1.328.594-1.328 1.323 0 .485.267.905.659 1.136-.026.141-.043.283-.043.429-.001 1.955 2.404 3.546 5.359 3.546 2.956 0 5.36-1.591 5.36-3.546 0-.137-.015-.272-.038-.405.416-.224.703-.657.703-1.16zm-8.612.908c0-.434.355-.788.791-.788.436 0 .79.353.79.788 0 .434-.355.787-.79.787-.436.001-.791-.352-.791-.787zm4.53 2.335c-.398.396-1.024.589-1.912.589l-.007-.001-.007.001c-.888 0-1.514-.193-1.912-.589-.073-.072-.073-.19 0-.262.072-.072.191-.072.263 0 .325.323.864.481 1.649.481l.007.001.007-.001c.784 0 1.324-.157 1.649-.481.073-.072.19-.072.263 0 .073.072.073.19 0 .262zm-.094-1.547c-.436 0-.79-.353-.79-.787 0-.434.355-.788.79-.788.436 0 .79.353.79.788 0 .434-.354.787-.79.787z"/>
    </svg>
    `;
  }

  render() {
    return html`
      <input id="x" type="text" placeholder="${placeHolder}" .value="${this.user}" @change=${this.onChangeInput} />
      <button @click=${this.fetchData}>Fetch</button>
      <div class="gallery">
      ${
      this.posts.length === 0
      ? html`<div class="nodata">${this.reddit()}</div>`
        : this.posts
          .filter((post: any): any => post.data.url)
          .map((post: any) => html`<a class="gallery__link" href=${post.data.url} target="_blank">
                <figure class="gallery__thumb">
                  ${this.embed(post.data)}
                  <figcaption class="gallery__caption">${post.data.title}</figcaption>
                </figure>
              </a>`)
          .chunk(this.column)
          .map((posts: any) => html`<div class="gallery__column">${posts}</div>`)
      }
      </div>

      ${ this.posts.length ? html`<center><button class="loadmore" @click=${this.loadMore}>Load more</button></center>` : ''}
     `;
  }
}
