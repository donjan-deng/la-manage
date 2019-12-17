import { Directive, Input, AfterViewInit, ElementRef, TemplateRef, ViewContainerRef, HostListener, Renderer } from '@angular/core';

@Directive({ selector: '[appCan]' })
export class CanDirective {

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef
    ) { }

    @Input() set appCan(param) {
        const perms = param[0];
        const path = param[1];
        if (perms && perms.indexOf(path) > -1) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}

@Directive({ selector: '[appSortTable]' })
export class SortTableDirective implements AfterViewInit {
    sortDirection = '';
    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer
    ) { }

    @Input('data-list') dataList: Array<any>;
    @Input('sort-key') sortKey: string;

    @HostListener('click') onClick() {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.sortTable();
    }
    ngAfterViewInit() {
        // this.renderer.setElementClass(this.elementRef.nativeElement, 'sortable', true);
        this.elementRef.nativeElement.className = 'sortable both';
    }
    private sortTable() {
        this.dataList.sort((v1, v2) => {
            const value1 = Number(v1[this.sortKey]);
            const value2 = Number(v2[this.sortKey]);
            if (this.sortDirection == 'desc') {
                if (value1 < value2) {
                    return 1;
                } else if (value1 > value2) {
                    return -1;
                } else {
                    return 0;
                }
            } else {
                if (value1 > value2) {
                    return 1;
                } else if (value1 < value2) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });
        this.elementRef.nativeElement.className = 'sortable ' + this.sortDirection;
    }
}