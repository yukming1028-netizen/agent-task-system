import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            role: any;
            displayName: any;
            avatarUrl: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            role: string;
            displayName: string | null;
            avatarUrl: string | null;
        };
    }>;
    getProfile(userId: number): Promise<{
        agentStatus: {
            id: number;
            updatedAt: Date;
            userId: number;
            status: string;
            currentTaskCount: number;
            lastActive: Date;
        } | null;
        id: number;
        username: string;
        email: string;
        role: string;
        displayName: string | null;
        avatarUrl: string | null;
        isAvailable: boolean;
        currentTasks: number;
        maxTasks: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
