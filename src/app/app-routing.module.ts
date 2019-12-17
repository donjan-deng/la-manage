import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { ReuseStrategy } from './app-reusestrategy.module';
import { AuthInterceptor } from './app-auth-interceptor.module';
// helper
import { ArrayToStringPipe } from './helpers/pipes';
import { CanDirective, SortTableDirective } from './helpers/directive';
// 通用
import { IndexComponent } from './views/index/index.component';
import { LoginComponent } from './views/index/login.component';
// 系统管理
import { UserListComponent } from './views//user/list.component';
import { RoleListComponent } from './views//role/list.component';
import { PermissionListComponent } from './views/permission/list.component';
const routes: Routes = [
  { path: 'index/login', component: LoginComponent },
  { path: 'index', component: IndexComponent },
  // 系统管理
  { path: 'users', component: UserListComponent },
  { path: 'roles', component: RoleListComponent },
  { path: 'permissions', component: PermissionListComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgZorroAntdModule,
    ReactiveFormsModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    IndexComponent,
    LoginComponent,
    // 系统管理
    RoleListComponent,
    UserListComponent,
    PermissionListComponent,
    // helper
    ArrayToStringPipe,
    CanDirective,
    SortTableDirective
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: ReuseStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})
export class AppRoutingModule { }
