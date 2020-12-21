import * as PIXI from 'pixi.js';
import fit from 'math-fit';
import gsap from 'gsap';

import t1 from './assets/dew-drops-rain-drops.jpg';
import t2 from './assets/dan-aragon-n20DUSVsUk8-unsplash.jpg';
import t3 from './assets/earth.jpg';
import t4 from './assets/godafoss-1840758_1920.jpg';
import t5 from './assets/izuddin-helmi-adnan-413027-unsplash.jpg';
import t6 from './assets/lake-surrounded-by-mountains-during-golden-hour-1126382.jpg';
// import disp from './assets/displace.png';
import disp from './assets/radialGradient.jpg';
// import t7 from './assets/sunset-1370447_1920.jpg';

function loadImages(paths, whenLoaded) {
  const imgs = [];
  const imgO = [];
  paths.forEach(function(path) {
    const img = new Image();
    img.onload = function() {
      imgs.push(img);
      imgO.push({path, img});
      if (imgs.length === paths.length) whenLoaded(imgO);
    }
    img.src = path;
  });
}

class Sketch {
  constructor() {
    this.app = new PIXI.Application({ 
      backgroundColor: 0x1099bb,
      resizeTo: window
    });
    document.body.appendChild(this.app.view);
    this.margin = 50;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.width = (window.innerWidth - 2*this.margin)/3;
    this.height = window.innerHeight*0.8;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.images = [t1,t2,t3,t4,t5,t6];
    this.WHOLEWIDTH = this.images.length*(this.width + this.margin);

    loadImages(this.images, (images) => {
      this.loadedImages = images;
      this.add();
      this.render();
      this.scrollEvent();
      this.addFilter();
    });

    
  }

  scrollEvent() {
    document.addEventListener('mousewheel', (e) => {
      this.scrollTarget = e.wheelDelta/3;
    });
  }

  addFilter() {
    this.displacementSprite = PIXI.Sprite.from(disp);
    this.app.stage.addChild(this.displacementSprite);

    let target = {
      // w: 152,
      // h: 152,
      w: 512,
      h: 512,
    }

    let parent = {
      w: window.innerWidth,
      h: window.innerHeight,
    }

    let cover = fit(target, parent);

    this.displacementSprite.position.set(cover.left, cover.top);
    this.displacementSprite.scale.set(cover.scale, cover.scale);

    this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);

    this.displacementFilter.scale.x = 0;
    this.displacementFilter.scale.y = 0;
    this.container.filters = [this.displacementFilter]
  }

  add() {
    let parent = {
      w: this.width,
      h: this.height,
    }
    this.thumbs = [];
    this.loadedImages.forEach((img, i) => {
      let texture = PIXI.Texture.from(img.img);
      const sprite = new PIXI.Sprite(texture);
      let container = new PIXI.Container();
      let spriteContainer = new PIXI.Container();

      let mask = new PIXI.Sprite(PIXI.Texture.WHITE)
      mask.width = this.width;
      mask.height = this.height;

      sprite.mask = mask;

      // sprite.width = 100;
      // sprite.height = 100;

      sprite.anchor.set(0.5);
      // console.log(sprite);
      sprite.position.set(
        sprite.texture.orig.width/2,
        sprite.texture.orig.height/2,
      )

      let image = {
        w: sprite.texture.orig.width,
        h: sprite.texture.orig.height,
      }

      let cover = fit(image, parent);
      // console.log(cover);

      spriteContainer.position.set(cover.left, cover.top);
      spriteContainer.scale.set(cover.scale, cover.scale)

      container.x = (this.margin + this.width)*i;
      container.y = this.height/10;

      spriteContainer.addChild(sprite);
      container.interactive = true;
      container.on('mouseover', this.mouseOn);
      container.on('mouseout', this.mouseOut);
      container.addChild(spriteContainer);
      container.addChild(mask);
      this.container.addChild(container);
      this.thumbs.push(container);
    });
  }

  mouseOn(e) {
    let el = e.target.children[0].children[0];
    // console.log(e);
    gsap.to(el.scale, {
      duration: 1,
      x: 1.1,
      y: 1.1
    });
  }
  
  mouseOut(e) {
    let el = e.currentTarget.children[0].children[0];
    // console.log(e);
    gsap.to(el.scale, {
      duration: 1,
      x: 1,
      y: 1
    });
  }

  calcPos(scr, pos) {
    let temp = (scr + pos + this.WHOLEWIDTH + this.width + this.margin)%this.WHOLEWIDTH - this.width - this.margin;
    return temp;
  }

  render() {
    this.app.ticker.add(() => {
      this.app.renderer.render(this.container);
      this.direction = this.scroll>0?-1:1;
      this.scroll -=(this.scroll - this.scrollTarget)*0.1;
      this.scroll *=0.9;
      this.thumbs.forEach(th => {
        th.position.x =this.calcPos(this.scroll, th.position.x) 
      });
      this.displacementFilter.scale.x = 6*this.direction*Math.abs(this.scroll);
    });
  }
}

new Sketch();








