require('./cimage.less');
class CImage {
	constructor(options){
		this.isMobile = /mobile/i.test(window.navigator.userAgent);
		if(this.isMobile){
			console.log('Mobile');
		}

		//default options
		const defaultOptions = {
			element:document.getElementById('cimage'),
			allowNewSelect:true,
			allowMove:true,
			allowResize:true,
			bgColor:'#000',
			bgOpacity:0.6,
			borderOpacity:0.4,

			handleOpacity:0.5,
			handleSize:5,
			//选框宽高比 w/h
			aspectRatio:null,
			hasPreview:true,
			//有宽高比时设定
			previewSize:[200],
			createHandles:['n','e','s','w','ne','se','sw','nw'],
			createBorders:['n','e','s','w'],
			drawBorders	:true,
			minSize:[0,0],
			maxSize:[0,0],
			onChange:function(){},
			onSelect:function(){},
			onRelease:function(){},
		}

		for(let key in defaultOptions){
			if(defaultOptions.hasOwnProperty(key) && !options.hasOwnProperty(key)){
				options[key] = defaultOptions[key];
			}
		}
		this.options = options;
		this.disable = false;
		
		this.parentElement = this.options.element.parentNode;
		this.eleOriginId = this.options.element.getAttribute('id');
		this.eleOriginHTML = this.options.element.outerHTML;
		let eleHtml = `<div class="cimage-main">
							${this.eleOriginHTML}
							<div class="cimage-box" style="z-index:100;">
							    <div class="cimage-border" style="z-index:-1;"></div>
							    <div class="cimage-handle"></div>
							    <div class="cimage-handle"></div>
							    <div class="cimage-handle"></div>
							    <div class="cimage-handle"></div>
							    <div class="cimage-handle"></div>
							    <div class="cimage-handle"></div>
							    <div class="cimage-handle"></div>
							    <div class="cimage-handle"></div>
							</div>
							<div class="cimage-shadow"></div>
							<div class="cimage-shadow"></div>
							<div class="cimage-shadow"></div>
							<div class="cimage-shadow"></div>
						</div>`;
		if(this.options.hasPreview && this.options.aspectRatio){
			for(let i=0;i<this.options.previewSize.length;i++){
				eleHtml += `<div class="cimage-preview-box">
							 <img class="cimage-preview" src="" alt="preview">
						   </div>`;
			}			
		}
		this.options.element.outerHTML = eleHtml;
		this.options.element = document.getElementById(this.eleOriginId);
		this.wrapElement = this.options.element.parentNode;
		this.clipBox = this.wrapElement.getElementsByClassName('cimage-box')[0];
		this.previewBoxs = document.getElementsByClassName('cimage-preview-box');
		this.previews = document.getElementsByClassName('cimage-preview');
		this.setPos(this.wrapElement,{"width":this.options.element.offsetWidth,"height":this.options.element.offsetHeight});
		this.setReset();
		const createClipBox = (startPos,eleSize,interval,p,limit,limitSize,store)=>{
			return (e)=>{
				//鼠标移动距离
				let disPos = {"X":(e.pageX - startPos.X),"Y":(e.pageY - startPos.Y)};
				//固定宽高时是否由X方向主导
				let leadByX = p ? (Math.abs(disPos.X)/Math.abs(disPos.Y)  < p  ? false : true):false;
				//截取框的宽高值(limit标识是否达到边界)
				let size = {
					"X":p ? (limit ? limitSize.X : (leadByX ? Math.abs(disPos.X) : Math.abs(disPos.Y)*p)): Math.abs(disPos.X),
					"Y":p ? (limit ? limitSize.Y : (leadByX ? Math.abs(disPos.X)/p : Math.abs(disPos.Y))): Math.abs(disPos.Y),
				};
				if(this.options.maxSize[0] && size.X > this.options.maxSize[0]){
					size.X = this.options.maxSize[0];
					if(p)
						size.Y = size.X/p;
				}
				if(this.options.maxSize[1] && size.Y > this.options.maxSize[1]){
					size.Y = this.options.maxSize[1];
					if(p)
						size.X = size.Y*p;
				}
				//disPos.X/disPos.Y 大于0时表示 left+width/top+height 小于0时表示 left/top
				let offsetPos = {
					"X":(disPos.X > 0 ? interval.X + size.X : interval.X - size.X),
					"Y":(disPos.Y > 0 ? interval.Y + size.Y : interval.Y - size.Y)
				};
				if(0 < offsetPos.X && offsetPos.X < eleSize.width && 0 < offsetPos.Y && offsetPos.Y < eleSize.height ){
					//固定宽高值时判断何时解除limit
					limit = p ? null : false;
					store = [];
				}
				//拖到最上面
				if(offsetPos.Y < 0){
					if(!store.includes('top'))
						store.push('top');
	            }
				//拖到最右边
				if (offsetPos.X > eleSize.width) {
					if(!store.includes('right'))
						store.push('right');
	            }
				//拖到最左边
				if(offsetPos.X < 0){
					if(!store.includes('left'))
						store.push('left');
	            }
				//拖到最下面
				if (offsetPos.Y > eleSize.height) {
					if(!store.includes('bottom'))
						store.push('bottom');
	       			
	            }
	            for(let i = 0;i<store.length;i++){
	            	switch (store[i]){
	            		case 'top':
	            			size.Y = interval.Y;
	            			offsetPos.Y = 0;
	            			if(p){
	            				size.X = size.Y*p;
	            				limit = true;
	            			}
	            			break;
	        			case 'right':
	        				size.X = eleSize.width - interval.X;
	        				if(p){
	        					size.Y = size.X/p;
	        					limit = true;
	        				}
	        				break;
	    				case 'bottom':
	        				size.Y = eleSize.height - interval.Y;
			       			if(p){
			       				size.X = size.Y*p;
			                	limit = true;
			       			}
	        				break;
	    				case 'left':
	        				size.X = interval.X;
							offsetPos.X = 0;
							if(p){
								size.Y = size.X/p;
								limit = true;
							}
	        				break;
	            	}
	            }
	            //存储到达边界时的截取框宽高值
				limitSize = {"X":size.X,"Y":size.Y};
				if(Math.abs(disPos.X) < size.X && Math.abs(disPos.Y) < size.Y){
					//固定宽高值时判断何时解除limit
					limit = p ? null : false;
					store = [];
				}
				//disPos.X/disPos.Y 大于0时，left/top值用interval.X/Y表示
				//disPos.X/disPos.Y 大于0时，left/top值用offsetPos.X/Y表示
				this.setPos(this.clipBox,{"left":disPos.X > 0 ? interval.X :offsetPos.X,"width":size.X});
				this.setPos(this.clipBox,{"top":disPos.Y > 0 ? interval.Y:offsetPos.Y,"height":size.Y});
				this.setBorders();
				this.setShadows();
				this.setPreview();
				e.preventDefault();
				if(this.options.onChange)
					this.options.onChange();
			}
		}

		this.options.element.onmousedown = (e)=>{
			if(this.disable)
				return;
			let startPos = {"X":e.pageX,"Y":e.pageY};
			let eleSize = {
				"width":this.options.element.offsetWidth,
				"height":this.options.element.offsetHeight,
				"left":this.getDocPos(this.options.element).left,
				"top":this.getDocPos(this.options.element).top
			};
			let interval = {"X":(startPos.X - eleSize.left),"Y":(startPos.Y - eleSize.top)}
			let p = this.options.aspectRatio;
			let limit = null;
			let limitSize = null;
			let store = [];
			let fnMove = createClipBox(startPos,eleSize,interval,p,limit,limitSize,store);
			document.addEventListener('mousemove', fnMove, false);
			let This = this;
			document.addEventListener('mouseup', function fnUp(){
				if(This.clipBox.offsetWidth > 0 && This.clipBox.offsetHeight > 0){
					if((This.options.minSize[0] && This.clipBox.offsetWidth < This.options.minSize[0])||(This.options.minSize[1] && This.clipBox.offsetHeight < This.options.minSize[1])){
						This.setReset();
						if(This.options.onRelease)
							This.options.onRelease();
					}
					else{
						This.setHandles();
						if(This.isFunction(This.options.onSelect))
							This.options.onSelect();
					}
				}
				document.removeEventListener('mousemove', fnMove, false);
				document.removeEventListener('mouseup', fnUp, false);
			}, false);
		}
		
		const clipBoxMove = (disPos)=>{
			return (e) =>{
				//限制截取框移动范围
				let left = e.pageX - disPos.X;
				let top = e.pageY - disPos.Y;
				if(left<=0){
                    left=0;
                }else if(left>=(this.options.element.offsetWidth-this.clipBox.offsetWidth)){
                   left = this.options.element.offsetWidth-this.clipBox.offsetWidth;
                }
                if(top<=0){
                    top=0;
                }else if(top>=(this.options.element.offsetHeight-this.clipBox.offsetHeight)){
                   top = this.options.element.offsetHeight-this.clipBox.offsetHeight;
                }
                this.setPos(this.clipBox,{"left":left,"top":top});
				this.setShadows();
				this.setPreview();
				e.preventDefault();
				if(this.options.onChange)
					this.options.onChange();
			}
		}
		this.clipBox.addEventListener('mousedown', (e)=>{
			if(this.disable || !this.options.allowMove || e.target.className.includes('cimage-handle'))
				return;
			let disPos = {"X":(e.pageX -this.clipBox.offsetLeft),"Y":(e.pageY - this.clipBox.offsetTop)};
			let fnMove = clipBoxMove(disPos);
			document.addEventListener('mousemove', fnMove, false);
			let This = this;
			document.addEventListener('mouseup', function fnUp(){
				document.removeEventListener('mousemove', fnMove, false);
				document.removeEventListener('mouseup', fnUp, false);
			}, false);
		},false);

		const clipBoxResize = (startPos,startSize,cursor,p,interval,eleSize,limit,limitSize,store)=>{
			return (e)=>{
				//鼠标移动距离
				let disPos = {"X":(e.pageX - startPos.X),"Y":(e.pageY - startPos.Y)};
				let leadByX = null;
				let size = null;
				if(cursor.match(/nw|sw|se|ne/)){
					//固定宽高时是否由X方向主导
					leadByX = p ? (Math.abs(disPos.X)/Math.abs(disPos.Y)  < p  ? false : true):false;
					//截取框的宽高值(limit标识是否达到边界)
					size = {
						"X":p ? (limit ? limitSize.X : (leadByX ? Math.abs(disPos.X) : Math.abs(disPos.Y)*p)): Math.abs(disPos.X),
						"Y":p ? (limit ? limitSize.Y : (leadByX ? Math.abs(disPos.X)/p : Math.abs(disPos.Y))): Math.abs(disPos.Y),
					};
				}else{
					//固定宽高时是否由X方向主导
					leadByX = p ?((cursor == 'w-resize' || cursor =='e-resize') ? true : false):false;
					//截取框的宽高值(limit标识是否达到边界)
					size = {
						"X": limit?limitSize.X:(leadByX ? Math.abs(disPos.X) : (p ? Math.abs(disPos.Y)*p : startSize.width)),
						"Y": limit?limitSize.Y:(leadByX ? (p ? Math.abs(disPos.X)/p:startSize.height) : Math.abs(disPos.Y)),
					}
				}
				if(this.options.minSize[0] && size.X < this.options.minSize[0]){
					size.X = this.options.minSize[0];
					if(p)
						size.Y = size.X/p;
				}
				if(this.options.minSize[1] && size.Y < this.options.minSize[1]){
					size.Y = this.options.minSize[1];
					if(p)
						size.X = size.Y*p;
					//防止按宽高比变换后X小于最小值
					if(this.options.minSize[0] && size.X < this.options.minSize[0]){
						size.X = this.options.minSize[0];
						if(p)
							size.Y = size.X/p;
					}
				}
				if(this.options.maxSize[0] && size.X > this.options.maxSize[0]){
					size.X = this.options.maxSize[0];
					if(p)
						size.Y = size.X/p;
				}
				if(this.options.maxSize[1] && size.Y > this.options.maxSize[1]){
					size.Y = this.options.maxSize[1];
					if(p)
						size.X = size.Y*p;
					//防止按宽高比变换后Y小于最小值
					if(this.options.maxSize[0] && size.X > this.options.maxSize[0]){
						size.X = this.options.maxSize[0];
						if(p)
							size.Y = size.X/p;
					}
				}
				//disPos.X/disPos.Y 大于0时表示 left+width/top+height 小于0时表示 left/top
				let offsetPos = {
					"X":(disPos.X > 0 ? interval.X + size.X : interval.X - size.X),
					"Y":(disPos.Y > 0 ? interval.Y + size.Y : interval.Y - size.Y)
				};
				if(0 < offsetPos.X && offsetPos.X < eleSize.width && 0 < offsetPos.Y && offsetPos.Y < eleSize.height ){
					//固定宽高值时判断何时解除limit
					limit = p ? null : false;
					store = [];
				}
				//拖到最上面
				if(offsetPos.Y < 0){
					if(!store.includes('top'))
						store.push('top');
	            }
				//拖到最右边
				if (offsetPos.X > eleSize.width) {
					if(!store.includes('right'))
						store.push('right');
	            }
				//拖到最左边
				if(offsetPos.X < 0){
					if(!store.includes('left'))
						store.push('left');
	            }
				//拖到最下面
				if (offsetPos.Y > eleSize.height) {
					if(!store.includes('bottom'))
						store.push('bottom');
	       			
	            }
	            for(let i = 0;i<store.length;i++){
	            	switch (store[i]){
	            		case 'top':
	            			size.Y = interval.Y;
	            			offsetPos.Y = 0;
	            			if(p){
	            				size.X = size.Y*p;
	            				limit = true;
	            			}
	            			break;
	        			case 'right':
	        				size.X = eleSize.width - interval.X;
	        				if(p){
	        					size.Y = size.X/p;
	        					limit = true;
	        				}
	        				break;
	    				case 'bottom':
	        				size.Y = eleSize.height - interval.Y;
			       			if(p){
			       				size.X = size.Y*p;
			                	limit = true;
			       			}
	        				break;
	    				case 'left':
	        				size.X = interval.X;
							offsetPos.X = 0;
							if(p){
								size.Y = size.X/p;
								limit = true;
							}
	        				break;
	            	}
	            }
	            //存储到达边界时的截取框宽高值
				limitSize = {"X":size.X,"Y":size.Y};
				if(Math.abs(disPos.X) < size.X && Math.abs(disPos.Y) < size.Y){
					//固定宽高值时判断何时解除limit
					limit = p ? null : false;
					store = [];
				}
				
				//disPos.X/disPos.Y 大于0时，left/top值用interval.X/Y表示
				//disPos.X/disPos.Y 大于0时，left/top值用offsetPos.X/Y表示
				this.setPos(this.clipBox,{"left":disPos.X > 0 ? interval.X :offsetPos.X,"width":size.X});
				this.setPos(this.clipBox,{"top":disPos.Y > 0 ? interval.Y:offsetPos.Y,"height":size.Y});
				this.setBorders();
				this.setHandles();
				this.setShadows();
				this.setPreview();
				e.preventDefault();
				if(this.options.onChange)
					this.options.onChange();
			}
		}

		this.clipBox.addEventListener('mousedown',(e)=>{
			if(this.disable || !this.options.allowResize || !e.target.className.includes('cimage-handle'))
				return false;
			let startPos = {"X":e.pageX,"Y":e.pageY};
			let interval = {"X":0,"Y":0}
			let cursor = this.getStyle(e.target,'cursor');
			let p = this.options.aspectRatio;
			let eleSize = {
				"width":this.options.element.offsetWidth,
				"height":this.options.element.offsetHeight,
				"left":this.getDocPos(this.options.element).left,
				"top":this.getDocPos(this.options.element).top
			};
			let startSize = {
				"width":this.clipBox.offsetWidth,
				"height":this.clipBox.offsetHeight,
				"left":this.clipBox.offsetLeft,
				"top":this.clipBox.offsetTop
			};			
			switch (cursor){
				case 'nw-resize':
					startPos = {"X":e.pageX+startSize.width,"Y":e.pageY+startSize.height};
					interval = {"X":startSize.left+startSize.width,"Y":startSize.top+startSize.height};
					break;
				case 'ne-resize':
					startPos = {"X":e.pageX - startSize.width,"Y":e.pageY+startSize.height};
					interval = {"X":startSize.left,"Y":startSize.top+startSize.height};
					break;
				case 'sw-resize':
					startPos = {"X":e.pageX+startSize.width,"Y":e.pageY-startSize.height};
					interval = {"X":startSize.left+startSize.width,"Y":startSize.top};
					break;
				case 'se-resize':
					startPos = {"X":e.pageX-startSize.width,"Y":e.pageY-startSize.height};
					interval = {"X":startSize.left,"Y":startSize.top};
					break;
				case 'n-resize':
					startPos = {"X":e.pageX-startSize.width/2,"Y":e.pageY+startSize.height};
					interval = {"X":startSize.left,"Y":startSize.top+startSize.height};
					break;
				case 'e-resize':
					startPos = {"X":e.pageX-startSize.width,"Y":e.pageY-startSize.height/2};
					interval = {"X":startSize.left,"Y":startSize.top};
					break;
				case 's-resize':
					startPos = {"X":e.pageX-startSize.width/2,"Y":e.pageY-startSize.height};
					interval = {"X":startSize.left,"Y":startSize.top};
					break;
				case 'w-resize':
					startPos = {"X":e.pageX+startSize.width,"Y":e.pageY-startSize.height/2};
					interval = {"X":startSize.left+startSize.width,"Y":startSize.top};
					break;
				default:
					startPos = {"X":e.pageX,"Y":e.pageY};
					interval = {"X":startSize.left,"Y":startSize.top};
			}
			let limit = null;
			let limitSize= {"top":0,"left":0,"width":0,"height":0};
			let store = [];
			let fnMove = clipBoxResize(startPos,startSize,cursor,p,interval,eleSize,limit,limitSize,store);
			document.addEventListener('mousemove', fnMove, false);
			let This = this;
			document.addEventListener('mouseup', function fnUp(){
				This.setHandles();
				document.removeEventListener('mousemove', fnMove, false);
				document.removeEventListener('mouseup', fnUp, false);
			}, false);
		},false);


		let oCimageShadows = this.wrapElement.getElementsByClassName('cimage-shadow');
		for(let i=0;i<oCimageShadows.length;i++){
			oCimageShadows[i].onmousedown = (e)=>{
				if(this.disable || !this.options.allowNewSelect)
					return;
				let eleSize = {
					"width":this.options.element.offsetWidth,
					"height":this.options.element.offsetHeight,
					"left":this.getDocPos(this.options.element).left,
					"top":this.getDocPos(this.options.element).top
				};
				this.setReset();
				oCimageShadows[0].style.display = 'block';
				this.setPos(oCimageShadows[0],{"width":eleSize.width,"height":eleSize.height,"top":0,"left":0});
				let startPos = {"X":e.pageX,"Y":e.pageY};
				let interval = {"X":(startPos.X - eleSize.left),"Y":(startPos.Y - eleSize.top)}
				let p = this.options.aspectRatio;
				let limit = null;
				let limitSize = null;
				let store = [];
				let fnMove = createClipBox(startPos,eleSize,interval,p,limit,limitSize,store);
				document.addEventListener('mousemove', fnMove, false);
				let This = this;
				document.addEventListener('mouseup', function fnUp(){
					if((This.clipBox.offsetWidth <= 0 && This.clipBox.offsetHeight <= 0)||(This.options.minSize[0] && This.clipBox.offsetWidth < This.options.minSize[0])||(This.options.minSize[1] && This.clipBox.offsetHeight < This.options.minSize[1])){
						This.setReset();
						if(This.options.onRelease)
							This.options.onRelease();
					}else{
						This.setHandles();
						if(this.isFunction(This.options.onSelect))
							This.options.onSelect();
					}
					document.removeEventListener('mousemove', fnMove, false);
					document.removeEventListener('mouseup', fnUp, false);
				}, false);
			}
		}
	}
	// ----------------------------API
	setImage(imgSrc, callback){
		if(this.disable)
			return;
		this.options.element.src = imgSrc;
		if(this.isFunction(callback))
			callback();
	}
	setOptions(options){
		if(this.disable)
			return;
		for(let key in this.options){
			if(this.options.hasOwnProperty(key) && !options.hasOwnProperty(key)){
				options[key] = this.options[key];
			}
		}
	}
	setSelect(pos){
		if(this.disable)
			return;
		let p = this.options.aspectRatio;
		let w = Math.abs(pos.x2-pos.x1);
		let h = p ? w/p : Math.abs(pos.y2-pos.y1);
		let t = pos.y1;
		let l = pos.x1;
		if(pos.x1<0 || pos.x2<0 || pos.y2<0 || pos.y1 <0 || pos.x1>this.element.offsetWidth || pos.x2>this.element.offsetWidth || pos.y1>this.element.offsetHeight||pos.y2>this.element.offsetHeight){
			alert('参数超出范围');
			return;
		}else if((this.options.minSize[0] && w < this.options.minSize[0]) || (this.options.minSize[1] && h < this.options.minSize[1])){
			alert('设置的宽度或高度小于设置的最小值');
			return;
		}else if((this.options.maxSize[0] && w > this.options.maxSize[0]) || (this.options.maxSize[1] && h > this.options.maxSize[1])){
			alert('设置的宽度或高度大于设置的最大值');
			return;
		}
		if(pos.x2 < pos.x1){
			l = pos.x2;
		}
		if(pos.y2 < pos.y1){
			t = pos.y2;
		}
		this.setPos(this.clipBox,{"width":w,"height":h,"left":l,"top":t});
		this.setBorders();
		this.setShadows();
		this.setHandles();
		if(this.isFunction(this.options.onSelect))
			this.options.onSelect();
	}
	getSelectInfo(){
		let width = this.clipBox.offsetWidth;
		let height = this.clipBox.offsetHeight;
		let x1 = this.clipBox.offsetLeft;
		let y1 = this.clipBox.offsetTop;
		let x2 = x1 + width;
		let y2 = y1 + height;
		return {"x1":x1,"y1":y1,"x2":x2,"y2":y2,"width":width,"height":height};
	}
	release(){
		if(this.disable)
			return;
		this.setReset();
	}
	destroy(){
		if(this.disable)
			return;
		if(this.parentElement){
			this.parentElement.removeChild(this.wrapElement);
			this.parentElement.innerHTML = this.eleOriginHTML;
		}
	}
	disable(){
		if(!this.disable)
			this.disable = true;
	}
	enable(){
		if(this.disable)
			this.disable = false;
	}
	// public function
	setBorders(){
		let border = this.options.createBorders;
		let oCimageBorder = this.wrapElement.getElementsByClassName('cimage-border')[0];
		if (this.options.drawBorders && this.isArray(border)){
			oCimageBorder.style.display = 'block';
			for(let i=0;i<border.length;i++){
				switch(border[i]){
					case 'n':
						this.addClass(oCimageBorder,'bd-top');
						break;
					case 'e':
						this.addClass(oCimageBorder,'bd-right');
						break;
					case 's':
						this.addClass(oCimageBorder,'bd-bottom');
						break;
					case 'w':
						this.addClass(oCimageBorder,'bd-left');
						break;
				}
			}

			oCimageBorder.style.opacity = this.options.borderOpacity;
			oCimageBorder.style.boxSizing = 'border-box';
			let clipBoxSize = {"width":this.clipBox.offsetWidth,"height":this.clipBox.offsetHeight};
			this.setPos(oCimageBorder,{"width":clipBoxSize.width,"height":clipBoxSize.height});
		}
	}

	setHandles(){
		let handle = this.options.createHandles;
		if(this.isArray(handle)){
			let oCimageHandles = this.wrapElement.getElementsByClassName('cimage-handle');
			let clipBoxSize = {"width":this.clipBox.offsetWidth,"height":this.clipBox.offsetHeight};
			for(let i=0;i<handle.length;i++){
				oCimageHandles[i].style.display = 'block';
				oCimageHandles[i].style.opacity = this.handleOpacity;
				this.setPos(oCimageHandles[i],{"width":this.options.handleSize,"height":this.options.handleSize});
				switch(handle[i]){
					case 'n':
						this.addClass(oCimageHandles[i],'hd-n');
						this.setPos(oCimageHandles[i],{"left":(clipBoxSize.width - this.options.handleSize)/2,"top":(- this.options.handleSize)/2});
						break;
					case 'e':
						this.addClass(oCimageHandles[i],'hd-e');
						this.setPos(oCimageHandles[i],{"right":(- this.options.handleSize)/2,"top":(clipBoxSize.height - this.options.handleSize)/2});
						break;
					case 's':
						this.addClass(oCimageHandles[i],'hd-s');
						this.setPos(oCimageHandles[i],{"left":(clipBoxSize.width - this.options.handleSize)/2,"bottom":(- this.options.handleSize)/2});
						break;
					case 'w':
						this.addClass(oCimageHandles[i],'hd-w');
						this.setPos(oCimageHandles[i],{"left":(- this.options.handleSize)/2,"top":(clipBoxSize.height - this.options.handleSize)/2});
						break;
					case 'ne':
						this.addClass(oCimageHandles[i],'hd-ne');
						this.setPos(oCimageHandles[i],{"right":(- this.options.handleSize)/2,"top":(- this.options.handleSize)/2});
						break;
					case 'se':
						this.addClass(oCimageHandles[i],'hd-se');
						this.setPos(oCimageHandles[i],{"right":(- this.options.handleSize)/2,"bottom":(- this.options.handleSize)/2});
						break;
					case 'sw':
						this.addClass(oCimageHandles[i],'hd-sw');
						this.setPos(oCimageHandles[i],{"left":(- this.options.handleSize)/2,"bottom":(- this.options.handleSize)/2});
						break;
					case 'nw':
						this.addClass(oCimageHandles[i],'hd-nw');
						this.setPos(oCimageHandles[i],{"left":(- this.options.handleSize)/2,"top":(- this.options.handleSize)/2});
						break;
				}
			}
		}
	}

	setShadows(){
		let oCimageShadows = this.wrapElement.getElementsByClassName('cimage-shadow');
		let eleSize = {"width":this.options.element.offsetWidth,"height":this.options.element.offsetHeight};
		let clipBoxSize = {
			"width":this.clipBox.offsetWidth,
			"height":this.clipBox.offsetHeight,
			"left":this.clipBox.offsetLeft,
			"top":this.clipBox.offsetTop
		};
		for(let i=0;i<oCimageShadows.length;i++){
			oCimageShadows[i].style.display = 'block';
			oCimageShadows[i].style.backgroundColor = this.options.bgColor;
			oCimageShadows[i].style.opacity = this.options.bgOpacity;
		}
		//上
		this.setPos(oCimageShadows[0],{
			"width":clipBoxSize.width,
			"height":clipBoxSize.top,
			"top":0,
			"left":clipBoxSize.left
		});
		//右
		this.setPos(oCimageShadows[1],{
			"width":eleSize.width - clipBoxSize.left - clipBoxSize.width,
			"height":eleSize.height,
			"top":0,
			"right":0
		});
		//下
		this.setPos(oCimageShadows[2],{
			"width":clipBoxSize.width,
			"height":eleSize.height - clipBoxSize.top - clipBoxSize.height,
			"bottom":0,
			"left":clipBoxSize.left
		});
		//左
		this.setPos(oCimageShadows[3],{
			"width":clipBoxSize.left,
			"height":eleSize.height,
			"top":0,
			"left":0
		});
	}

	setPreview(){
		if(this.options.hasPreview && this.options.aspectRatio){
			for(let i=0;i<this.options.previewSize.length;i++){
				this.setPos(this.previewBoxs[i],{"width":this.options.previewSize[i],"height":Math.round(this.options.previewSize[i]/this.options.aspectRatio)});
            	let p = this.previewBoxs[i].offsetWidth/this.clipBox.offsetWidth;
            	let rect = 'rect(' + this.clipBox.offsetTop * p + 'px ' + ((this.clipBox.offsetLeft + this.clipBox.offsetWidth) * p) + 'px ' + ((this.clipBox.offsetTop + this.clipBox.offsetHeight) * p) + 'px ' + this.clipBox.offsetLeft * p + 'px)';
            	this.previews[i].style.clip = rect;
            	this.setPos(this.previews[i],{"top":(-this.clipBox.offsetTop * p),"left":(-this.clipBox.offsetLeft * p),"width":(this.options.element.offsetWidth*p),"height":(this.options.element.offsetHeight*p)});
			}	
		}
	}

	setReset(){
		let oCimageShadows = this.wrapElement.getElementsByClassName('cimage-shadow');
		let oCimageHandles = this.wrapElement.getElementsByClassName('cimage-handle');
		for(let i=0;i<oCimageShadows.length;i++){
			this.setPos(oCimageShadows[i],{"width":0,"height":0});
			oCimageShadows[i].style.display = 'none';
		}
		for(let i=0;i< oCimageHandles.length;i++){
			// this.setPos(oCimageHandles[i],{"left":0,"top":0});
			oCimageHandles[i].style.display = 'none';
		}
		this.wrapElement.getElementsByClassName('cimage-border')[0].style.display = 'none';
		this.setPos(this.clipBox,{"width":0,"height":0,"left":0,"top":0});

		if(this.options.hasPreview && this.options.aspectRatio){
			for(let i=0;i<this.options.previewSize.length;i++){
				this.previews[i].src = this.options.element.src;
				this.setPos(this.previewBoxs[i],{"width":this.options.previewSize[i],"height":Math.round(this.options.previewSize[i]/this.options.aspectRatio)});
            	let rect = 'rect(0 '+this.previewBoxs[i].offsetWidth+'px '+this.previewBoxs[i].offsetHeight+'px 0)';
            	this.previews[i].style.clip = rect;
            	this.setPos(this.previews[i],{"top":0,"left":0,"width":this.options.element.offsetWidth,"height":this.options.element.offsetHeight});
			}	
		}
	}
	// tool function
	getDocPos(obj){
		let pos = {"left":0,"top":0};
		while(obj){
			pos.left+=obj.offsetLeft;
			pos.top+=obj.offsetTop;
			obj=obj.offsetParent;
		}
		return pos;
	}
	isArray(obj){
		return Object.prototype.toString.call(obj) == "[object Array]";
	}

	isFunction(obj){
		return Object.prototype.toString.call(obj) == "[object Function]";
	}

	addClass(obj,cl){
		if(obj.className == ''){
			obj.className = cl;
		}
		else{
			let arrClassName = obj.className.split(' ');
			if(!arrClassName.includes(cl)){
				obj.className += ' ' + cl;
			}
		}
	}
	getStyle(obj,attr){
		return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr];
	}
	setPos(obj,attr){
		for(let key in attr){
			obj.style[key] = attr[key]+'px';
		}
	}
}
module.exports = CImage;