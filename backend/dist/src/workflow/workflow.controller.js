"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflow_service_1 = require("./workflow.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WorkflowController = class WorkflowController {
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    designToDev(id, req) {
        return this.workflowService.designToDev(id, req.user.userId);
    }
    devToQa(id, req) {
        return this.workflowService.devToQa(id, req.user.userId);
    }
    getPendingAssignments() {
        return this.workflowService.getPendingAssignments();
    }
    getAvailableDevelopers() {
        return this.workflowService.getAvailableDevelopers();
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)('design-to-dev/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "designToDev", null);
__decorate([
    (0, common_1.Post)('dev-to-qa/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "devToQa", null);
__decorate([
    (0, common_1.Get)('pending-assignments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "getPendingAssignments", null);
__decorate([
    (0, common_1.Get)('available-developers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "getAvailableDevelopers", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, swagger_1.ApiTags)('Workflow'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/workflow'),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map