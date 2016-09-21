/**
 * Created by Administrator on 2016/3/20.
 */
angular.module('kaifanla',['ng']).
    controller('parentCtr',function($scope){
        $scope.jump = function(path){
            //console.log(path);
            $.mobile.changePage(path,{'transition':'slide'});
        }
        //监听每个page的创建事件，只要DOM树新增加了元素，都会
        //重新编译连接，然后进入循环，从而使动态添加了元素生效
        $(document).on('pagecreate', function (event) {
            //监听到了page的创建
            //console.log('page is creating....');
            //获取要加载到的容器
            var page = event.target;
            //获取作用域对象
            var scope = $(page).scope();
            //获取注入器对象
            var injector = $(page).injector();
            //调用注入器，为程序提供$compile服务
            injector.invoke(function($compile){
                //编译并链接DOM节点
                $compile($(page))(scope);
                scope.$digest();
            });
        })
    }).controller('startCtr',function($scope){

    }).controller('mainCtr',function($scope,$http){
        /*加载数据*/
        $scope.hasMore = true;  //是否还有更多数据可供加载
        $scope.dishList = [];  //用于保存所有菜品数据的数组

        //控制器初始化/页面加载时，从服务器读取最前面的5条记录
        $http.get('../data/dish_getbypage.php?start=0').
            success(function(data){
                $scope.dishList = data;//$scope.dishList.concat(data);
            });
        //“加载更多”按钮的单击事件处理函数：每点击一次，加载更多的5条数据
        $scope.loadMore = function(){
            $http.get('../data/dish_getbypage.php?start='+$scope.dishList.length).
                success(function(data){
                    if(data.length<5){  //服务器返回的菜品数量不足5条
                        $scope.hasMore = false;
                    }
                    $scope.dishList = $scope.dishList.concat(data);
                });
        }
        //监视搜索框中的内容是否改变——监视 kw Model变量
        $scope.$watch('kw', function(){
            if( $scope.kw ){
                $http.get('../data/dish_getbykw.php?kw='+$scope.kw).
                    success(function(data){
                        $scope.dishList = data;
                    })
            }
        })
       //将选中的id传递给detail页面
        $scope.showDetail=function(dishId){
            //console.log(dishId);
            //保存用户的选项，甚至可以在其它页面使用
            //甚至浏览器重新启动时仍然可以使用
            // localStorage.setItem('dishId',dishId);
             localStorage.id=dishId;
             $.mobile.changePage('detail.html');
        }
    }).controller('detailCtr',function($scope,$http){
        //读取用户的选项
       // var dishId=localStorage.getItem(dishId);
        var dishId=localStorage.id;
        $http.get('../data/dish_getbyid.php?id='+dishId)
            .success(function(data){
                $scope.dish = data[0];
            })
    }).controller('orderCtr',function($scope,$http){
        //定义order对象，用于保存order数据
        $scope.order = {"did":localStorage.id};
        $scope.submitOrder = function(){
            var str = jQuery.param($scope.order);
            $http.get('../data/order_add.php?'+str).
                success(function(data){
                   // console.log(data[0].msg);
                    if(data[0].msg == 'succ'){
                        $scope.succMsg = '订餐成功！您的订单编号为：'+data[0].did+'。您可以在用户中心查看订单状态。'
                        //记载用户手机号，用于查询订单
                         localStorage.phone = $scope.order.phone;
                    }else {
                        $scope.errMsg = '订餐失败！错误码为：'+data[0].reason;
                    }
                })
        }
    }).controller('myorderCtr',function($scope,$http){
        $http.get('../data/order_getbyphone.php?phone='+ localStorage.phone).
            success(function(data){
                console.log(data);
                 $scope.orderList = data;
                console.log(data);
        });
    })


