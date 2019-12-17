import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNodeOptions, NzTreeNode } from 'ng-zorro-antd';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { AppComponent } from '../../app.component';
import { Helper } from '../../helpers/helper';

@Component({
  templateUrl: './list.component.html',
  styles: [
    `
      :host ::ng-deep .ant-tree {
        overflow: hidden;
        margin: 0 -24px;
        padding: 0 24px;
      }
      :host ::ng-deep .ant-tree li {
        padding: 4px 0 0 0;
      }
      .custom-node {
        cursor: pointer;
        line-height: 24px;
        margin-left: 4px;
        display: inline-block;
        margin: 0 -1000px;
        padding: 0 1000px;
      }
      .active {
        background: #1890ff;
        color: #fff;
      }
    `
  ]
})

export class PermissionListComponent {
  @ViewChild('nzTreeComponent', { static: false }) nzTreeComponent: NzTreeComponent;
  nodes = [];
  selectNodes = [];
  activedNode: NzTreeNode;
  dialog = {
    visible: false,
    loading: false
  };
  form: FormGroup;
  constructor(
    private http: HttpClient,
    public app: AppComponent,
    private fb: FormBuilder,
    private nzContextMenuService: NzContextMenuService
  ) {
    this.form = this.fb.group({
      id: [],
      parent_id: [0, [Validators.required]],
      name: ['', [Validators.required]],
      display_name: [],
      url: [],
      sort: [],
    });
    this.init();
  }
  init() {
    this.getList();
  }
  getList() {
    const url = this.app.config.services.user_center + '/permissions';
    this.http.get(url).subscribe((resp: any) => {
      this.nodes = this.buildNode(resp);
      this.selectNodes = [{
        title: '顶级节点',
        key: 0,
        expanded: true,
        isLeaf: false,
        children: this.nodes
      }];
    });
  }
  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }
  activeNode(data: NzFormatEmitEvent): void {
    this.activedNode = data.node!;
  }
  add() {
    Helper.resetForm(this.form);
    this.form.get('id').setValue(0);
    this.form.get('parent_id').setValue(0);
    this.dialog.visible = true;
  }
  edit() {
    const model = this.activedNode.origin.data;
    Helper.resetForm(this.form);
    this.form.get('id').setValue(model.id);
    this.form.get('parent_id').setValue(model.parent_id);
    this.form.get('name').setValue(model.name);
    this.form.get('display_name').setValue(model.display_name);
    this.form.get('url').setValue(model.url);
    this.form.get('sort').setValue(model.sort);
    this.dialog.visible = true;
  }
  save() {
    Helper.validateForm(this.form);
    if (this.form.valid) {
      this.dialog.loading = true;
      let url = this.app.config.services.user_center + '/permissions';
      let service = this.http.post(url, this.form.value);
      if (this.form.value.id > 0) {
        url = this.app.config.services.user_center + '/permissions/' + this.form.value.id;
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
  buildNode(data) {
    let nodes = [];
    for (const m of data) {
      let node = {
        title: m.display_name,
        key: m.id,
        expanded: true,
        isLeaf: m.child.length === 0,
        data: m
      };
      if (m.child.length > 0) {
        Object.assign(node, { children: this.buildNode(m.child) });
      }
      nodes.push(node);
    }
    return nodes;
  }
}
