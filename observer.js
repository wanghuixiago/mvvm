class Observer{
    constructor(data){
        this.observe(data)
    }
    observe(data){
        //遍历这个数据，将原有的属性改为get 和set;对象才能劫持
        if(!data || typeof data !== "object"){
            return;
        }
        var self = this;
        //要将数据一一劫持，先获取到data的key \value
        Object.keys(data).forEach(function(key){
            //劫持--响应式
            self.defineReactive(data,key,data[key])
            self.observe(data[key]) //不能只做第一层劫持，深度劫持递归
        })
    }
    //定义响应式
    defineReactive(data,key,value){
        var that = this;
        let dep = new Dep(); //每个变化的数据都会对应一个数组，这个数组是存放所有更新的操作
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:true,
            get(){//当取值时调用的方法
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue){//当给data属性中设置值的时候，更改获取的属性的值
                if(newValue!==value){
                    //这里的this并不是实例  vm.message = {b:1}
                    that.observe(newValue);//如果是对象，继续劫持
                    value = newValue;
                    dep.notify();//通知所有人，数据更新了
                }
            }
        })
    }
}
class Dep{
    constructor(){
        //订阅的数组
        this.subs = [];
    }
    addSub(watcher){
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher =>watcher.update());
    }
}