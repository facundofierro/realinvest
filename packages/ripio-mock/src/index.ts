import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import crypto from "node:crypto";
import {
  notAuthenticated,
  notEnoughBalance,
  notFound,
  validationError,
} from "./errors.js";
import {
  debitBalance,
  getOrCreateEndUser,
  getState,
  isValidAccessToken,
  issueAccessToken,
  resetState,
} from "./state.js";

const port = Number(
  process.env.PORT ?? "4010"
);
const host =
  process.env.HOST ?? "127.0.0.1";

async function main() {
  const server = Fastify({
    logger: process.env.LOG_LEVEL
      ? { level: process.env.LOG_LEVEL }
      : true,
  });

  await server.register(cors, {
    origin: true,
  });
  await server.register(formbody);
  await server.register(multipart);

  server.get("/health", async () => ({
    ok: true,
  }));

  server.post(
    "/__admin/reset",
    async (_req, reply) => {
      await resetState();
      return reply
        .status(200)
        .send({ ok: true });
    }
  );

  server.post(
    "/oauth2/token/",
    async (req, reply) => {
      const contentType =
        req.headers["content-type"] ??
        "";
      const getValue = (
        v: unknown
      ): string | undefined => {
        if (typeof v === "string")
          return v;
        if (
          Array.isArray(v) &&
          typeof v[0] === "string"
        )
          return v[0];
        return undefined;
      };

      let grantType: string | undefined;
      let clientId: string | undefined;
      let clientSecret:
        | string
        | undefined;

      if (
        contentType.includes(
          "multipart/form-data"
        )
      ) {
        const parts = req.parts();
        for await (const part of parts) {
          if (part.type !== "field")
            continue;
          if (
            part.fieldname ===
            "grant_type"
          )
            grantType = String(
              part.value
            );
          if (
            part.fieldname ===
            "client_id"
          )
            clientId = String(
              part.value
            );
          if (
            part.fieldname ===
            "client_secret"
          )
            clientSecret = String(
              part.value
            );
        }
      } else {
        const body = (req.body ??
          {}) as Record<
          string,
          unknown
        >;
        grantType = getValue(
          body.grant_type
        );
        clientId = getValue(
          body.client_id
        );
        clientSecret = getValue(
          body.client_secret
        );
      }

      if (
        grantType !==
        "client_credentials"
      ) {
        return reply
          .status(400)
          .send(
            validationError(
              "grant_type must be client_credentials"
            )
          );
      }
      if (!clientId || !clientSecret) {
        return reply
          .status(400)
          .send(
            validationError(
              "client_id and client_secret are required"
            )
          );
      }

      const { issuedTokens } =
        await getState();
      const accessToken =
        issueAccessToken(issuedTokens);
      return reply.status(200).send({
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 36000,
      });
    }
  );

  server.addHook(
    "preHandler",
    async (req, reply) => {
      if (
        req.url.startsWith(
          "/oauth2/token/"
        )
      )
        return;
      if (
        req.url.startsWith("/__admin/")
      )
        return;
      if (req.url.startsWith("/health"))
        return;

      const auth =
        req.headers.authorization ?? "";
      const token = auth.startsWith(
        "Bearer "
      )
        ? auth
            .slice("Bearer ".length)
            .trim()
        : null;
      if (!token) {
        return reply
          .status(403)
          .send(notAuthenticated());
      }
      const { issuedTokens } =
        await getState();
      if (
        !isValidAccessToken(
          issuedTokens,
          token
        )
      ) {
        return reply
          .status(403)
          .send(notAuthenticated());
      }
    }
  );

  server.get(
    "/api/v1/end-users/:endUserId/balances/",
    async (req, reply) => {
      const { endUserId } =
        req.params as {
          endUserId: string;
        };
      const { endUsers } =
        await getState();
      const user = getOrCreateEndUser(
        endUsers,
        endUserId
      );

      const query = req.query as {
        currency?: string | string[];
      };
      const requested = Array.isArray(
        query.currency
      )
        ? query.currency
        : typeof query.currency ===
            "string"
          ? query.currency
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : null;

      const balances = requested
        ? user.balances.filter((b) =>
            requested.includes(
              b.currency
            )
          )
        : user.balances;

      return reply
        .status(200)
        .send(balances);
    }
  );

  server.get(
    "/api/v1/end-users/:endUserId/addresses/",
    async (req, reply) => {
      const { endUserId } =
        req.params as {
          endUserId: string;
        };
      const { endUsers } =
        await getState();
      const user = getOrCreateEndUser(
        endUsers,
        endUserId
      );
      return reply
        .status(200)
        .send(user.addresses);
    }
  );

  server.post(
    "/api/v1/end-users/:endUserId/addresses/",
    async (req, reply) => {
      const { endUserId } =
        req.params as {
          endUserId: string;
        };
      const body = (req.body ?? {}) as {
        network?: string;
      };
      const network =
        body.network?.trim();
      if (!network) {
        return reply
          .status(400)
          .send(
            validationError(
              "network is required"
            )
          );
      }

      const { endUsers } =
        await getState();
      const user = getOrCreateEndUser(
        endUsers,
        endUserId
      );

      const existing =
        user.addresses.find(
          (a) => a.network === network
        );
      if (!existing) {
        user.addresses.push({
          network,
          end_user_id: endUserId,
          address: `T${cryptoRandomBase32(33)}`,
          xpub: "wSeET7",
          derivation_path: "m/24",
        });
      }

      return reply
        .status(200)
        .send(user.addresses);
    }
  );

  server.post(
    "/api/v1/withdrawals/",
    async (req, reply) => {
      const body = (req.body ?? {}) as {
        end_user?: string;
        currency?: string;
        address?: string;
        network?: string;
        amount?: number;
        external_ref?: string;
        withdrawal_fee_id?: string;
      };

      const endUserId =
        body.end_user?.trim();
      const currency =
        body.currency?.trim();
      const address =
        body.address?.trim();
      const network =
        body.network?.trim();
      const amount =
        typeof body.amount === "number"
          ? body.amount
          : Number(body.amount);

      if (
        !endUserId ||
        !currency ||
        !address ||
        !network ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return reply
          .status(400)
          .send(
            validationError(
              "end_user, currency, address, network and positive amount are required"
            )
          );
      }

      const { endUsers, withdrawals } =
        await getState();
      const user = getOrCreateEndUser(
        endUsers,
        endUserId
      );
      const debit = debitBalance(
        user,
        currency,
        amount
      );
      if (!debit.ok) {
        return reply
          .status(400)
          .send(notEnoughBalance());
      }

      const id = cryptoRandomUuid();
      const now =
        new Date().toISOString();
      const record = {
        id,
        created_at: now,
        confirmation_date: null,
        txn_hash: null,
        end_user_id: endUserId,
        currency,
        amount,
        address,
        charged_fee: 0,
        network_name: network,
        status: "PENDING" as const,
        external_ref: body.external_ref,
      };

      withdrawals.unshift(record);

      return reply
        .status(200)
        .send(record);
    }
  );

  server.get(
    "/api/v1/withdrawals/:withdrawalId/",
    async (req, reply) => {
      const { withdrawalId } =
        req.params as {
          withdrawalId: string;
        };
      const { withdrawals } =
        await getState();
      const found = withdrawals.find(
        (w) => w.id === withdrawalId
      );
      if (!found) {
        return reply
          .status(404)
          .send(
            notFound(
              "Withdrawal not found"
            )
          );
      }
      return reply
        .status(200)
        .send(found);
    }
  );

  await server.listen({ port, host });
}

main().catch((err) => {
  process.stderr.write(
    `${String(err)}\n`
  );
  process.exit(1);
});

function cryptoRandomUuid(): string {
  return crypto.randomUUID();
}

function cryptoRandomBase32(
  length: number
): string {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyz234567";
  const bytes = crypto.randomBytes(
    Math.ceil((length * 5) / 8)
  );
  let out = "";
  let bits = 0;
  let value = 0;
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (
      bits >= 5 &&
      out.length < length
    ) {
      out +=
        alphabet[
          (value >>> (bits - 5)) & 31
        ];
      bits -= 5;
    }
  }
  return out.slice(0, length);
}
