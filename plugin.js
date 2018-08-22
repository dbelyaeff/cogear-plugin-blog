module.exports = {
		apply(){
			cogear.on('preload',()=>{
				this.init()
			})
			cogear.on('preload.page.parse',(page)=>{
				if(this.regex.index.test(page.file)){
					return false
				}
			})
			cogear.on('build.page.layout',([page,layout])=>{
				if(this.regex.index.test(page.file)){
					let pages = Object.entries(cogear.pages)
					page.tags = []
					let blog_entries = pages
					.filter(([file,p])=>this.regex.entries.test(file))
					.map(([file,p])=>{
						if(p.tags){
							page.tags = page.tags.concat(page.tags)
						}
						return	p
					})
					page.posts = blog_entries.sort((a,b)=>{
							let aDate = new Date(a.date).getTime()
							let bDate = new Date(b.date).getTime()
							// Sort in DESC order
							return aDate > bDate ? -1 : 1;
					})
					page.content = cogear.parser.render(page.__content, page)
				}
			})
		},
		init(){
			cogear.config.blog = cogear.config.blog || {}
			this.regex = {
				index: new RegExp(cogear.config.blog.index || '^blog\\.'),
				entries: new RegExp(cogear.config.blog.entries || '^blog\/')
			}
		}
}