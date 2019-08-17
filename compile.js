class Compile{
    constructor(el,vm){
        this.el = this.isElementNode(el)?
        el:document.querySelector(el);
        this.vm = vm;
        if(this.el){//如果元素可以获取到，才开始编译
            /* 取v-指令 、 {{}} 文本 */
            //1.先把真实的dom移动到内存中
            let fragment = this.node2fragment(this.el);
            //2.提取想要的元素节点v-model和文本节点{{}}
            this.compile(fragment);
            //3.编译好的fragment再塞回页面里去
            this.el.appendChild(fragment)
        }
    }
    //辅助方法
    isElementNode(node){
        return node.nodeType === 1;
    }
    isDirective(name){
        return name.indexOf('v-')>-1
    }
    //核心方法
    node2fragment(el){//需要将el中的内容全部放到内存中
        let fragment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild){
            fragment.appendChild(firstChild)
        }
        return fragment;
    }
    compileElement(node){
        //带v-model
        let attrs = node.attributes;
        var self = this;
        Array.from(attrs).forEach(function(attr){
            let attrName = attr.name;
            if(self.isDirective(attrName)){//attr.name attr.value;判断属性名字是否包含v-
                //取到对应的值放到节点上面
                let expr = attr.value;
                //node this.vm.$data
                //let [,type] = attrName.split("-")
                let type = attrName.slice(2);
                CompileUtil[type](node,self.vm,expr);
            }
        })
    }
    compileText(node){
        //带{{}}
        let expr = node.textContent;//取文本中的内容
        let reg = /\{\{([^}]+)\}\}/g;
        if(reg.test(expr)){
            //node this.vm.$data text
            CompileUtil['text'](node,this.vm,expr);
        }  
    }
    compile(fragment){
        let childNodes = fragment.childNodes;
        // console.log(childNodes)
        var self = this;
        Array.from(childNodes).forEach( function(node) {
            if(self.isElementNode(node)){ 
                //是元素节点,需要继续深入检查
                //console.log("Element",node)
                //编译元素
                self.compileElement(node)
                self.compile(node)
                
            } else{
               // console.log("text",node)
               //编译文本
               self.compileText(node)
            }
        })
    }
}
CompileUtil = {
    getVal(vm,expr){ //获取实例上对应的数据  
       expr = expr.split('.');
       return expr.reduce(function(prev,next){
            //vm.$data.a
            return prev[next];
       },vm.$data)
    },
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            return this.getVal(vm,arguments[1]);     
         })
    },
    text(node,vm,expr){
        let updateFn =  this.update['textUpdater'];
        //vm.$data[expr] message.a [message,a] vm.$data.message.a
        let value =  this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            new Watcher(vm,arguments[1],(newValue)=>{
                //数据变化了，文本节点需要重新获取以来的属性更新后文本中的内容
                updateFn && updateFn(node,this.getTextVal(vm,expr))
            })   
         })
        updateFn && updateFn(node,value)
    },
    setVal(vm,expr,value){
        expr = expr.split(".");
        return expr.reduce((prev,next,cur)=>{
            if(cur === expr.length-1){
                return prev[next]  = value
            }
            return prev[next];
        },vm.$data)
    },
    model(node,vm,expr){
        let updateFn =  this.update['modelUpdater'];
        //vm.$data[expr] message.a [message,a] vm.$data.message.a
        //这里应该加监控，数据变化 应该调用watch的callback
        new Watcher(vm,expr,(newValue)=>{
            //当值变化后会调用cb，将新的值传过来
            updateFn && updateFn(node,this.getVal(vm,expr))
        })
        node.addEventListener('input',(e)=>{
            let newValue = e.target.value;
            this.setVal(vm,expr,newValue)

        })
        updateFn && updateFn(node,this.getVal(vm,expr))
       
    },
    //...
    update:{
        textUpdater(node,value){
            node.textContent = value;
        },
        modelUpdater(node,value){
            node.value = value;
        }
    }
}