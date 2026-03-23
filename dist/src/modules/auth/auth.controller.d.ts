import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatar: any;
        };
    }>;
    refresh(token: string): Promise<{
        accessToken: string;
    }>;
}
