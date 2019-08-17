class MVVM {
  constructor(options) {
      /* 首先把可用的东西挂在实例上 */
      this.$el = options.el;
      this.$data = options.data;
      //如果有编译的模版就开始编译
      if(this.$el){
        //数据劫持，把对象的所有属性改为get 和 set
        new Observer(this.$data)
        this.proxyData(this.$data)
        //用数据和元素进行编译
        new Compile(this.$el,this);
      }
  }
    proxyData(data){
        Object.keys(data).forEach(key =>{
            Object.defineProperty(this,key,{
                get(){
                    return data[key]
                },
                set(newValue){
                    data[key] = newValue;
                }
            })
        })
    }
}
