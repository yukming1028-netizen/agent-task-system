import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
        agentStatus: {
            updatedAt: Date;
            id: number;
            userId: number;
            status: string;
            currentTaskCount: number;
            lastActive: Date;
        } | null;
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
        id: number;
    }>;
}
