const path = require('path');
const {forEach} = require('p-iteration');
const merge = require('webpack-merge');
module.exports = {
  // Init method
  async init(){
    /**
			 * Blog section in config.yaml must look like this (optional):
			 * blog:
			 *  index: "news" # `blog` by default, virtual page. If page exists, data will be proceed to that page
			 */
    cogear.blog = this;
    let defaults = {
      index: 'blog', // Means `auto`, do it for me
      regex: null,
      split: '===',
      tagUri: 'tag',
      perPage: 3,
    };
    cogear.config.blog = cogear.config.blog ? merge(defaults,cogear.config.blog) : defaults;
    this.config = cogear.config.blog;
    // this.perPage = cogear.config.blog.perPage || 3
    this.regex = new RegExp(cogear.config.blog.regex || '^blog\/(?!tag).+','i');
    // split: new RegExp(cogear.config.blog.regex.cut || '\<p\>[:=_-]{3,}\<\/p\>','img')
    this.pages = {};
    // If no existing index page is configured, create one with 'blog' uri
    if(Object.keys(cogear.pages).includes(cogear.config.blog.index)){
      this.pages[''] = cogear.pages[cogear.config.blog.index];
    } else {
      await this.setIndexPage();
    }
  },
  apply(){
    // 1. Init on preload (when config has already been loaded)
    cogear.on('preload.done',async ()=>{
      await this.init();
      await this.build();
    });
    // 3. If page changed - watcher
    cogear.on('watcher.change.page',async(file)=>{
      if(this.regex.test(file.substr(1))){
        await this.rebuild();
      }
    });
    cogear.on('watcher.add.page',async(file)=>{
      if(this.regex.test(file.substr(1))){
        await this.rebuild();
      }
    });
    cogear.on('watcher.unlink.page',async([file,page])=>{
      if(this.regex.test(page.uri)){
        if(this.pages[page.uri]){
          delete this.pages[page.uri];
        }
        await this.rebuild();
      }
    });
    // cogear.on('preload.done',async ()=>{
    // 	await this.build()
    // })
  },
  async setIndexPage(){
    let result = await cogear.emit('preload.page',[null,{
      // title: 'Blog',
      content: '',
      __content: '',
      file: 'blog.md',
      uri: 'blog',
    }]);
    this.pages[''] = result.shift();
  },
  async rebuild(){
    await this.build();
    Object.entries(this.pages).forEach(async ([uri,page])=>{
      await cogear.emit('build.page',page);
    });
  },
  // Blog index build		
  async build(){
    let blog = this.pages[''];
    // Object.keys(this.pages).forEach(key=>{
    //   if(key != ''){
    //     delete this.pages[key];
    //   }
    // });
    return new Promise(async(resolve)=>{
      this.tags = [];
      // Get posts, map and sort them
      this.posts = Object.entries(cogear.pages)
        .filter(([file,p])=>this.regex.test(p.uri))
        .map(([file,post])=>{
          if(post.tags){
            this.tags = this.tags.concat(post.tags).filter((v, i, a) => a.indexOf(v) === i);
          }
          return post;
        })
        // .filter(post=>{
        //   let isTagPage = false;
        //   this.tags.forEach(tag=>{
        //     isTagPage = post.uri == path.join(blog.uri,tag);
        //   }); 
        //   return !isTagPage;
        // })
        .filter(post => {
          return !Object.keys(this.pages).includes(post.uri);
        })
        .map(post=>{
          if(typeof post.content == 'string'){
            const m = new RegExp(`^(.+)${this.config.split}(.*)$`, "s").exec(post.content);
            if(m){
              post.teaser = m[1];
              post.content = m[1] + m[2];
            } else {
              post.teaser = post.content;
            }
          }
          return post;
        })
        .sort((a,b)=>{
          let aDate = new Date(a.date).getTime();
          let bDate = new Date(b.date).getTime();
          // Sort in DESC order
          return aDate > bDate ? -1 : 1;
        });
      if(!this.posts.length) resolve();
      await this.buildPages(blog,this.posts);
      if(this.tags){
        await forEach(this.tags,(async(tag)=>{
          let tagPage = {...blog};
          tagPage.tag = tag;
          // tagPage.pagination = null
          tagPage.uri = path.join(this.config.tagUri,tag);
          // tagPage.path = path.join('tags',tag,'index.html')
          await this.buildPages(
            tagPage,
            this.posts.filter(post=>Array.isArray(post.tags) && post.tags.includes(tag))
          );
          tagPage = (await cogear.emit('preload.page',[null,tagPage])).shift();
          cogear.pages[tagPage.uri] = tagPage;
          this.pages[tagPage.uri] = tagPage;
        }));
      }
      resolve();
    });
  },
  async buildPages(page,posts){
    let paginator = {
      count: posts.length,
      current: 1,
      perPage: this.config.perPage,
      total: Math.ceil(posts.length/this.config.perPage),
      next: null,
      prev: null,
      baseUri: page.uri,
    };
				
    // If there is more than 1 page
    if(paginator.total > 1){
      let pageNum = 2;
					
      while(pageNum <= paginator.total){
        let newPage = {...page};
        let start = this.config.perPage*(pageNum-1);
        let end = start + this.config.perPage;
						
        newPage.posts = posts.slice(start,end);
        newPage.path = path.join(page.uri,pageNum + '','index.html');
        newPage.uri = path.join(page.uri,pageNum + '/');
        newPage.paginator = {...paginator};
        newPage.paginator.current = pageNum;
        if(pageNum < paginator.total){
          newPage.paginator.next = path.join(page.uri,String(pageNum+1));
        }
        if(pageNum > 2){
          newPage.paginator.prev = path.join(page.uri,String(pageNum-1));
        } else {
          newPage.paginator.prev = page.uri;
        }
        newPage.content = await cogear.parser.render(newPage.__content, newPage);
						
        cogear.pages[newPage.uri] = newPage; 
        this.pages[newPage.uri] = newPage;
        pageNum = pageNum+1;
      }
      paginator.next = path.join(page.uri,'2/');
      page.posts = posts.slice(0,this.config.perPage);
      page.paginator = paginator;
    } else {
      page.posts = posts;
      page.paginator = {...paginator};
    }		
  }
};