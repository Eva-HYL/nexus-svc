import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    register(body: {
        phone: string;
        password: string;
        nickname?: string;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, body: {
        nickname?: string;
        avatar?: string;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
