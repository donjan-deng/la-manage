import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class ReuseStrategy implements RouteReuseStrategy {

    public static handlers: { [key: string]: DetachedRouteHandle } = {}

    excludePath=[];//不使用复用策略的path

    /** 表示对所有路由允许复用 如果你有路由不想利用可以在这加一些业务逻辑判断 */
    public shouldDetach(route): boolean {
        const path = (<any>route)._routerState.url;
        return this.excludePath.indexOf(path) > -1 === false;
    }
    /** 当路由离开时会触发。按path作为key存储路由快照&组件当前实例对象 */
    public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const path = (<any>route)._routerState.url;
        ReuseStrategy.handlers[path] = handle;
    }
    /** 若 path 在缓存中有的都认为允许还原路由 */
    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const path = (<any>route)._routerState.url;
        if (!!route.routeConfig && !!ReuseStrategy.handlers[path]) {
            let snapshot = <any>ReuseStrategy.handlers[path];
            if (snapshot.componentRef && snapshot.componentRef.instance) {
                let prototype = snapshot.componentRef.instance.__proto__;
                if (prototype['init']) {
                    snapshot.componentRef.instance.init(); // 刷新页面数据
                }
            }
            return true;
        } else {
            return false;
        }
        //return !!route.routeConfig && !!ReuseStrategy.handlers[route.routeConfig.path]
    }
    /** 从缓存中获取快照，若无则返回nul */
    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        if (!route.routeConfig) {
            return null;
        }
        const path = (<any>route)._routerState.url;
        return ReuseStrategy.handlers[path];
    }

    /** 进入路由触发，判断是否同一路由 */
    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}
