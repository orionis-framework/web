import type { CodeSampleTab } from '@/components/code-sample-tabs';

export type SampleDefinition = Omit<CodeSampleTab, 'highlightedCode'> & {
  command: string;
  source: string;
};

export const codeSamples: SampleDefinition[] = [
  {
    id: 'http',
    label: 'HTTP',
    fileName: 'app/http/controllers/status_controller.py',
    command: 'make:http-controller StatusController --api',
    source: 'http_controller.stub',
    code: `from orionis.http import JSONResponse, response
from orionis.http.base import BaseController

class StatusController(BaseController):

    async def index(self) -> JSONResponse:
        return response.json({
            "framework": "Orionis",
            "status": "ready",
        })`,
  },
  {
    id: 'orm',
    label: 'ORM',
    fileName: 'app/models/user.py',
    command: 'make:model User',
    source: 'model.stub',
    code: `from typing import ClassVar
from orionis.orm import Integer, Model, String

class User(Model):
    id = Integer().primary().autoIncrement()
    name = String(120)
    status = String(50)
    email = String(255).unique()

    fillable: ClassVar[list[str]] = ["name", "email"]
    timestamps = False


async def active_users():
    data = await User.where("status", "active").get()
    return data`,
  },
  {
    id: 'queues',
    label: 'Queues',
    fileName: 'app/jobs/process_invoice.py',
    command: 'make:job ProcessInvoice',
    source: 'job.stub',
    code: `from typing import ClassVar
from orionis.logging.contracts.logger import ILogger
from orionis.queues import BaseJob

class ProcessInvoice(BaseJob):

    __slots__ = ("record_id",)

    record_id: int
    tries: ClassVar[int] = 3
    timeout: ClassVar[float] = 30.0
    backoff: ClassVar[tuple[float, ...]] = (1.0, 5.0)

    def __init__(self, record_id: int) -> None:
        self.record_id = record_id

    async def handle(self, logger: ILogger) -> None:
        logger.info(f"Processing invoice {self.record_id}.")`,
  },
  {
    id: 'mcp',
    label: 'MCP',
    fileName: 'app/mcp/servers/orionis_server.py',
    command: 'make:mcp-server OrionisServer',
    source: 'mcp_server.stub',
    code: `from orionis.mcp import Server

class OrionisServer(Server):

    name = "Orionis Server"
    version = "1.0.0"
    instructions = "Describe the capabilities of this server."

    tools = ()
    resources = ()
    prompts = ()`,
  },
  {
    id: 'console',
    label: 'Console',
    fileName: 'app/console/commands/greet_command.py',
    command: 'make:console-command GreetCommand',
    source: 'console_command.stub',
    code: `from typing import ClassVar
from orionis.console import Argument
from orionis.console.base import BaseCommand

class GreetCommand(BaseCommand):

    signature: str = "app:greet"
    description: str = "Greet a developer."
    arguments: ClassVar[list[Argument]] = [
        Argument(
            name_or_flags="name",
            help="Developer name.",
        ),
    ]

    async def handle(self) -> None:
        self.success(f"Hello, {self.getArgument('name')}!")`,
  },
  {
    id: 'middleware',
    label: 'Middleware',
    fileName: 'app/http/middleware/powered_by.py',
    command: 'make:http-middleware PoweredBy',
    source: 'http_middleware.stub',
    code: `from orionis.http import BaseMiddleware, NextCallable
from orionis.http import Request, Response

class PoweredBy(BaseMiddleware):

    async def handle(
        self,
        request: Request,
        call_next: NextCallable,
    ) -> Response:
        response = await call_next()
        response.setHeader("X-Powered-By", "Orionis")
        return response`,
  },
  {
    id: 'mail',
    label: 'Mail',
    fileName: 'app/mail/welcome_mail.py',
    command: 'make:mail WelcomeMail',
    source: 'mail.stub',
    code: `from orionis.mail import Content, Envelope, Mailable

class WelcomeMail(Mailable):

    def envelope(self) -> Envelope:
        return Envelope(subject="Welcome aboard")

    def content(self) -> Content:
        return Content(
            text="Your next great idea starts with Orionis.",
            html="<h1>Welcome to Orionis.</h1>",
        )`,
  },
  {
    id: 'tests',
    label: 'Tests',
    fileName: 'tests/test_arithmetic.py',
    command: 'make:test TestArithmetic',
    source: 'test.stub',
    code: `from orionis.test import TestCase

class TestArithmetic(TestCase):

    async def testAddition(self) -> None:
        self.assertEqual(2 + 2, 4)

    async def testFrameworkName(self) -> None:
        self.assertIn("Orionis", "Hello, Orionis!")`,
  },
  {
    id: 'migrations',
    label: 'Migrations',
    fileName: 'database/migrations/create_scheduler_tasks_table.py',
    command: 'make:database-migration CreateSchedulerTasksTable',
    source: 'database_migration.stub',
    code: `from orionis.database import Migration
from orionis.support.facades import Schema

class CreateSchedulerTasksTable(Migration):

        async def up(self) -> None:
                async with Schema.create("scheduler_tasks") as table:
                        table.unicode("id", 191).primary().comment("Job ID")
                        table.float("next_run_time").nullable().index().comment("Next Run Time")
                        table.largeBinary("job_state").comment("Job State")
                        table.comment("Table to store scheduled jobs (tasks).")

        async def down(self) -> None:
                await Schema.drop("scheduler_tasks")`,
  },
  {
    id: 'facades',
    label: 'Facades',
    fileName: 'app/facades/my_service.py',
    command: 'make:facade MyService --accessor my-service',
    source: 'facade.stub',
    code: `from orionis.container.facades.facade import Facade

class MyService(Facade):

        @classmethod
        def getFacadeAccessor(cls) -> str:
                return "my-service"`,
  },
];
