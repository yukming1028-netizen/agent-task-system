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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../common/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: registerDto.username },
                    { email: registerDto.email },
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Username or email already exists');
        }
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: registerDto.username,
                email: registerDto.email,
                passwordHash,
                role: registerDto.role,
                displayName: registerDto.displayName,
            },
        });
        await this.prisma.agentStatus.create({
            data: {
                userId: user.id,
                status: 'available',
            },
        });
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                agentStatus: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const { passwordHash, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map