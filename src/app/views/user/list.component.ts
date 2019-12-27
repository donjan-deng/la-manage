import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from '../../app.component';
import { Helper } from '../../helpers/helper';

@Component({
  templateUrl: './list.component.html',
})

export class UserListComponent {
  params = {
    username: '',
    phone: '',
    status: '',
    start_time: '',
    end_time: '',
    date_range: [],
    page: '1',
    per_page: '15',
    total: '1',
    sort_name: '',
    sort_value: ''
  };
  list = [];
  roleList = [];
  pageSizeOption = [15, 25, 50];
  dialog = {
    visible: false,
    loading: false
  };
  roleDialog = {
    visible: false,
    loading: false
  };
  form = this.fb.group({
    user_id: [],
    username: ['', Validators.required],
    password: [],
    confirm_password: [],
    real_name: ['', Validators.required],
    sex: [],
    phone: ['', Validators.required],
    status: []
  });
  roleForm = this.fb.group({
    user_id: [],
    username: [],
    roles: []
  });
  constructor(private http: HttpClient, public app: AppComponent, private fb: FormBuilder) {
    this.init();
  }
  init() {
    this.getList();
    this.getRoleList();
  }
  getList() {
    const httpParams = new HttpParams({ fromObject: this.params });
    this.http.get(this.app.config.services.user_center + '/users', { params: httpParams }).subscribe((resp: any) => {
      this.list = resp.data;
      this.params.total = resp.total;
      this.params.per_page = resp.per_page;
      this.params.page = resp.current_page;
    });
  }
  getRoleList() {
    const httpParams = new HttpParams({ fromString: 'per_page=100' });
    this.http.get(this.app.config.services.user_center + '/roles', { params: httpParams }).subscribe((resp: any) => {
      this.roleList = [];
      for (let r of resp.data) {
        this.roleList.push({
          label: r.name,
          value: r.id
        });
      }
    });
  }
  add() {
    Helper.resetForm(this.form);
    this.form.get('user_id').setValue(0);
    this.form.get('status').setValue(1);
    this.form.get('sex').setValue(1);
    this.form.get('username').reset({ value: '', disabled: false });
    this.dialog.visible = true;
  }
  edit(model) {
    Helper.resetForm(this.form);
    this.form.patchValue(model);
    this.form.get('username').reset({ value: model.username, disabled: true });
    this.dialog.visible = true;
  }
  save() {
    Helper.validateForm(this.form);
    if (this.form.valid) {
      this.dialog.loading = true;
      const data = this.form.value;
      if (data.user_id > 0 && !data.username) { // 设disabled后this.form.value.username不会传值过来，避免后端的验证，随便传一个
        data.username = '111';
      }
      let url = this.app.config.services.user_center + '/users';
      let service = this.http.post(url, data);
      if (data.user_id > 0) {
        url = this.app.config.services.user_center + '/users/' + data.user_id;
        service = this.http.put(url, data);
      }
      service.subscribe((resp: any) => {
        this.dialog.visible = false;
        this.getList();
        this.dialog.loading = false;
      },
        error => {
          this.dialog.loading = false;
        });
    }
  }
  close() {
    this.dialog.visible = false;
    this.dialog.loading = false;
  }
  editRole(model) {
    Helper.resetForm(this.roleForm);
    this.roleList.forEach(e => {
      e.checked = model.roles.findIndex(q => q.id === e.value) >= 0;
    });
    this.roleForm.get('username').reset({ value: model.username, disabled: true });
    this.roleForm.get('user_id').setValue(model.user_id);
    this.roleForm.get('roles').setValue(this.roleList);
    this.roleDialog.visible = true;
  }
  saveRole() {
    this.roleDialog.loading = true;
    const roles = [];
    this.roleForm.get('roles').value.forEach(q => {
      if (q.checked) {
        roles.push(q.value);
      }
    });
    this.http.put(
      this.app.config.services.user_center + `/users/${this.roleForm.get('user_id').value}/roles`,
      { roles: roles }
    ).subscribe((resp: any) => {
      this.roleDialog.visible = false;
      this.roleDialog.loading = false;
      this.getList();
    },
      error => {
        this.roleDialog.loading = false;
      });
  }
  closeRole() {
    this.roleDialog.visible = false;
    this.roleDialog.loading = false;
  }
  selectDate() {
    if (this.params.date_range.length > 0) {
      this.params.start_time = formatDate(this.params.date_range[0], 'yyyy-MM-dd 00:00:00', 'zh');
      this.params.end_time = formatDate(this.params.date_range[1], 'yyyy-MM-dd 23:59:59', 'zh');
    } else {
      this.params.start_time = '';
      this.params.end_time = '';
    }
    this.search();
  }
  search() {
    this.params.page = '1';
    this.getList();
  }
  goPage(page) {
    this.params.page = page;
    this.search();
  }
  changePageSize(size) {
    this.params.page = '1';
    this.params.per_page = size;
    this.search();
  }
  sort(name, value) {
    this.params.page = '1';
    this.params.sort_name = name;
    this.params.sort_value = value;
    this.search();
  }
}
