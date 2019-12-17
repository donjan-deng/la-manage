import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import * as moment from 'moment';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { Helper } from '../../helpers/helper';

@Component({
  templateUrl: './login.component.html',
  styles: [
    `
      .login-form {
        max-width: 400px;
        margin:10% auto;
      }

      .login-form-forgot {
        float: right;
      }

      .login-form-button {
        width: 100%;
      }
    `
  ]
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    protected app: AppComponent,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private storage: LocalStorageService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  submitForm() {
    Helper.validateForm(this.loginForm);
    if (this.loginForm.valid) {
      this.http.post(this.app.config.services.user_center + '/token', this.loginForm.value).subscribe((data: any) => {
        data.expires_time = moment().add(data.expires_in - 200, 'seconds');
        this.storage.store('token', data);
        this.router.navigate(['/index'], { queryParams: { refresh: true } });
      });
    }
    //批量赋值
    // this.profileForm.patchValue({
    //   firstName: 'Nancy',
    //   address: {
    //     street: '123 Drew Street'
    //   }
    // });
  }
}
