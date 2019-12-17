import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import * as moment from 'moment';
import { ReuseStrategy } from './app-reusestrategy.module';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  // 路由列表
  menuList = new Array<any>();
  // 当前用户的权限列表
  permissions: Array<any>;
  // 权限数组,[permission1,permission2]
  permsArr: Array<any>;
  // 目录
  menu: Array<any>;
  // 配置
  config;
  // 当前用户
  user;
  title = 'app';
  isCollapsed = false;
  // 激活的tab
  tabIndex = 1;

  triggerTemplate: TemplateRef<void> | null = null;
  @ViewChild('trigger', { static: false }) customTrigger: TemplateRef<void>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private storage: LocalStorageService
  ) {
    this.activatedRoute.queryParams.subscribe(data => {
      if (data && data['refresh']) {
        window.location.replace(window.location.pathname);
      }
    });
  }
  ngOnInit(): void {
    this.config = Object.assign(environment, this.config);
    const token = this.getToken();
    if (token) {
      this.permsArr = [];
      this.user = token.user;
      this.permissions = token.user.all_permissions;
      this.menu = token.user.menu;
      this.permissions.forEach((e) => {
        this.permsArr.push(e.name);
      });
      this.pushCurrTab();
      this.onNavigationEnd();
    }
  }
  // 当前路径添加进tab
  pushCurrTab() {
    const currPerm = this.permissions.find(e => e.url == this.router.url);
    if (currPerm) {
      this.titleService.setTitle(currPerm.display_name);
      this.menuList.push({
        title: currPerm.display_name,
        path: currPerm.url,
        select: true
      });
    } else {
      this.menuList.push({
        title: '后台首页',
        path: '/index',
        select: true
      });
    }
  }
  // 订阅路由事件
  onNavigationEnd() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const path = event.url;
        let perm = this.permissions.find(e => e.url == path);
        if (!perm) {
          if (path === '/index') {
            perm = {
              url: path,
              display_name: '后台首页'
            };
          } else {
            return;
          }
        }
        this.titleService.setTitle(perm.display_name);
        this.menuList.forEach(p => p.select = false);
        const exitMenu = this.menuList.find(e => e.path == perm.url);
        if (exitMenu) {// 如果存在不添加，当前表示选中
          this.menuList.forEach(p => p.select = p.path == exitMenu.path);
          return;
        }
        this.menuList.push({
          title: perm.display_name,
          path: perm.url,
          select: true
        });
      }
    });
  }
  // 关闭选项标签
  closeUrl(path, select) {
    // 当前关闭的是第几个路由
    let index = this.menuList.findIndex(p => p.path == path);
    // 如果只有一个不可以关闭
    if (this.menuList.length == 1 || select == false) {
      return;
    }
    this.menuList = this.menuList.filter(p => p.path != path);
    // 删除复用
    delete ReuseStrategy.handlers[path];
    if (!select) {
      return;
    }
    // 显示上一个选中
    index = index === 0 ? 0 : index - 1;
    let menu = this.menuList[index];
    this.menuList.forEach(p => p.select = p.path == menu.module);
    // 显示当前路由信息
    this.router.navigate([menu.path]);
  }
  logout() {
    this.storage.clear('token');
    window.location.reload();
  }
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }
  getToken() {
    const token = this.storage.retrieve('token');
    // console.log(token);
    if (!token || moment().diff(token.expires_time) > 0) {
      this.router.navigate(['/index/login']);
    } else {
      setInterval(() => {
        this.refreshToken();
      }, 1000 * 60 * 2);
    }
    return token;
  }
  refreshToken() {
    const token = this.storage.retrieve('token');
    if (token && moment(token.expires_time).diff(moment(), 'seconds') < 120) { // 如果在120秒内过期，进行刷新
      const url = this.config.services.user_center + '/refresh_token';
      this.http.post(url, {}).subscribe((resp: any) => {
        token.access_token = resp.access_token;
        token.expires_in = resp.expires_in;
        token.expires_time = moment().add(token.expires_in - 200, 'seconds');
        this.storage.store('token', token);
      });
    }
  }
}
