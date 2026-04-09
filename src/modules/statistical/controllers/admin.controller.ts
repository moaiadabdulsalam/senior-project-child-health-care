import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';



@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/overview/total')
  total() {
    return this.adminService.total();
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/doctorsProfile')
  doctorsProfile() {
    return this.adminService.doctorsProfile();
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/doctor-speciality')
  speciality() {
    return this.adminService.doctorSpeciality();
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/child-distribution')
  genderDistribution() {
    return this.adminService.genderDistribution();
  }

  @Get('/test')
  @Header('Content-Type', 'text/html; charset=utf-8')
  test(){
    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Romantic Page</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #ff9a9e, #fad0c4, #fad0c4);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }

          .card {
            background: rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-radius: 24px;
            padding: 40px 30px;
            text-align: center;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
            max-width: 500px;
            width: 90%;
            color: white;
          }

          h1 {
            margin: 0 0 15px;
            font-size: 2.2rem;
          }

          p {
            font-size: 1.1rem;
            line-height: 1.8;
            margin: 0;
          }

          .heart {
            font-size: 3rem;
            animation: pulse 1.5s infinite;
            display: block;
            margin-bottom: 18px;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.18); }
            100% { transform: scale(1); }
          }

          .floating-hearts span {
            position: absolute;
            bottom: -20px;
            color: rgba(255,255,255,0.7);
            font-size: 20px;
            animation: floatUp 8s linear infinite;
          }

          .floating-hearts span:nth-child(1) { left: 10%; animation-delay: 0s; }
          .floating-hearts span:nth-child(2) { left: 25%; animation-delay: 2s; }
          .floating-hearts span:nth-child(3) { left: 45%; animation-delay: 4s; }
          .floating-hearts span:nth-child(4) { left: 65%; animation-delay: 1s; }
          .floating-hearts span:nth-child(5) { left: 85%; animation-delay: 3s; }

          @keyframes floatUp {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            100% {
              transform: translateY(-110vh) scale(1.4);
              opacity: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="floating-hearts">
          <span>❤</span>
          <span>❤</span>
          <span>❤</span>
          <span>❤</span>
          <span>❤</span>
        </div>

        <div class="card">
          <span class="heart">❤</span>
          <h1>Hello from medo</h1>
          <p>
           You are so cute my Heart <br />,
           can you give me a hug ? 
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
/*
total doctor , total parent , total child , total active user ,
doctor profile , 
speciality , 
genderDistribution ,
*/
