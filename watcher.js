//观察者的目的就是给需要变化的元素增加一个观察者，当数据变化后执行对应的方法
/* 先给输入框添加观察者，用新值和旧值进行对比，发生变化旧调用更新方法 */
class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb =cb;
        //先获取一下旧值
        this.value = this.get();
    }
    getVal(vm,expr){ //获取实例上对应的数据  
        expr = expr.split('.');
        return expr.reduce(function(prev,next){
             //vm.$data.a
             return prev[next];
        },vm.$data)
     }
    get(){
        Dep.target = this;
        let value = this.getVal(this.vm,this.expr);
        Dep.target = null;
        return value
    }
    //对外暴露的方法
    update(){
        let newValue = this.getVal(this.vm,this.expr);
        let oldValue = this.value;
        if(newValue != oldValue){
            this.cb(newValue) //对应watch 的callback
        }
    }
}
// vm.$data expr 
//vm.$watch(vm,'a',function (params){})