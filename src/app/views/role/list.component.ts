import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd';
import { AppComponent } from '../../app.component';
import { Helper } from '../../helpers/helper';

@Component({
  templateUrl: './list.component.html',
})

export class RoleListComponent {
  @ViewChild('nzTreeComponent', { static: false }) nzTreeComponent: NzTreeComponent;
  params = {
    page: '1',
    per_page: '15',
    total: '1',
    sort_name: '',
    sort_value: ''
  };
  sortValue = {
    name: null,
    description: null
  };
  nodes = [];
  checkedKeys = []; // 选中的权限
  list = [];
  pageSizeOption = [15, 25, 50];
  dialog = {
    visible: false,
    loading: false
  };
  form: FormGroup;
  constructor(private http: HttpClient, public app: AppComponent, private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      description: [''],
      permissions: []
    });
    this.init();
  }
  init() {
    this.getList();
    this.getPerms();
  }
  getList() {
    const httpParams = new HttpParams({ fromObject: this.params });
    const url = this.app.config.services.user_center + '/roles';
    this.http.get(url, { params: httpParams }).subscribe((resp: any) => {
      this.list = resp.data;
      this.params.total = resp.total;
      this.params.per_page = resp.per_page;
      this.params.page = resp.current_page;
    });
  }
  getPerms() {
    const url = this.app.config.services.user_center + '/permissions';
    this.http.get(url).subscribe((resp: any) => {
      this.nodes = this.buildNode(resp);
    });
  }
  add() {
    Helper.resetForm(this.form);
    this.form.get('id').setValue(0);
    this.checkedKeys = [];
    this.dialog.visible = true;
  }
  edit(model) {
    Helper.resetForm(this.form);
    this.form.get('id').setValue(model.id);
    this.form.get('name').setValue(model.name);
    this.form.get('description').setValue(model.description);
    this.checkedKeys = [];
    for (let m of model.permissions) { // 如果父级有关联，设置顶级选中，下面的会全选上
      this.checkedKeys.push(m.id);
    }
    this.dialog.visible = true;
  }
  save() {
    Helper.validateForm(this.form);
    if (this.form.valid) {
      this.dialog.loading = true;
      const checkPerms = this.getCheckPerms(this.nzTreeComponent.getTreeNodes());
      this.form.get('permissions').setValue(checkPerms);
      let url = this.app.config.services.user_center + '/roles';
      let service = this.http.post(url, this.form.value);
      if (this.form.value.id > 0) {
        url = this.app.config.services.user_center + '/roles/' + this.form.value.id;
        service = this.http.put(url, this.form.value);
      }
      service.subscribe((resp: any) => {
        this.dialog.loading = false;
        this.dialog.visible = false;
        this.getList();
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
  buildNode(data) {
    let nodes = [];
    for (const m of data) {
      let node = {
        title: m.display_name,
        key: m.id,
        expanded: true,
        isLeaf: m.child.length === 0
      };
      if (m.child.length > 0) {
        Object.assign(node, { children: this.buildNode(m.child) });
      }
      nodes.push(node);
    }
    return nodes;
  }
  getCheckPerms(nodes) {
    let perms = [];
    for (let m of nodes) {
      if (m.isChecked || m.isHalfChecked) {
        perms.push(m.key);
      }
      const children = m.getChildren();
      if (children.length > 0) {
        const result = this.getCheckPerms(children);
        if (result) {
          perms = perms.concat(result);
        }
      }
    }
    return perms;
  }
}
