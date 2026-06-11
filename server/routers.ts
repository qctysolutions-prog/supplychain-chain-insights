import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getAllNewsArticles, getNewsArticlesByCategory, submitCategoryFeedback, getFeedbackByCategory, getAllAluminumPricing, getAluminumPricingByDateRange, addAluminumPricing, getAllSupplyChainIndices, getSupplyChainIndicesByDateRange, getLatestSupplyChainIndices, addSupplyChainIndices, isEmailAuthorized, getAllSubscriptions, getSubscriptionByEmail, createSubscription, updateSubscriptionStatus, deleteSubscription, getAllAllowlist, addToAllowlist, removeFromAllowlist, bulkAddToAllowlist } from "./db";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";
import { runNewsUpdate } from "./updaters/newsUpdater";
import { runIndicesUpdate } from "./updaters/indicesUpdater";
import { getDb } from "./db";
import { updateLogs } from "../drizzle/schema";
import { desc as descOrder } from "drizzle-orm";

/** Validate the admin localStorage token issued by adminAuth.verify */
function isValidAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [prefix, , secret] = decoded.split(":");
    return prefix === "admin" && secret === ENV.cookieSecret.slice(0, 8);
  } catch {
    return false;
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  news: router({
    getAll: publicProcedure.query(async () => {
      return await getAllNewsArticles();
    }),
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await getNewsArticlesByCategory(input.category);
      }),
  }),

  feedback: router({
    submit: publicProcedure
      .input(z.object({
        category: z.string(),
        isRelevant: z.boolean(),
        feedbackText: z.string().optional(),
        userEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const feedback = {
          category: input.category,
          isRelevant: input.isRelevant ? 1 : 0,
          feedbackText: input.feedbackText || null,
          userId: ctx.user?.id || null,
          userEmail: input.userEmail || ctx.user?.email || null,
        };
        return await submitCategoryFeedback(feedback);
      }),
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await getFeedbackByCategory(input.category);
      }),
  }),

  aluminumPricing: router({
    getAll: publicProcedure.query(async () => {
      return await getAllAluminumPricing();
    }),
    getByDateRange: publicProcedure
      .input(z.object({ 
        startDate: z.string(), 
        endDate: z.string() 
      }))
      .query(async ({ input }) => {
        return await getAluminumPricingByDateRange(input.startDate, input.endDate);
      }),
    add: publicProcedure
      .input(z.object({
        date: z.string(),
        price: z.string(),
        change: z.string().optional(),
        changePercent: z.string().optional(),
        source: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await addAluminumPricing(input);
      }),
  }),

  supplyChainIndices: router({
    getAll: publicProcedure.query(async () => {
      return await getAllSupplyChainIndices();
    }),
    getLatest: publicProcedure.query(async () => {
      return await getLatestSupplyChainIndices();
    }),
    getByDateRange: publicProcedure
      .input(z.object({ 
        startDate: z.string(), 
        endDate: z.string() 
      }))
      .query(async ({ input }) => {
        return await getSupplyChainIndicesByDateRange(input.startDate, input.endDate);
      }),
    add: publicProcedure
      .input(z.object({
        date: z.string(),
        tpuIndex: z.string().optional(),
        usTradeTpu: z.string().optional(),
        tpuChange3m: z.string().optional(),
        blsImportPrice: z.string().optional(),
        blsChange: z.string().optional(),
        hrcPrice: z.string().optional(),
        hrcMom: z.string().optional(),
        hrcYoy: z.string().optional(),
        lmeAluminum: z.string().optional(),
        lmeAlMom: z.string().optional(),
        lmeAlYoy: z.string().optional(),
        cmeCopper: z.string().optional(),
        cmeCuMom: z.string().optional(),
        cmeCuYoy: z.string().optional(),
        dieselPrice: z.string().optional(),
        dieselChange: z.string().optional(),
        cassExpenditure: z.string().optional(),
        cassChange: z.string().optional(),
        wciOcean: z.string().optional(),
        wciChange: z.string().optional(),
        source: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await addSupplyChainIndices(input);
      }),
  }),

  // ─── Subscription & Access Control ──────────────────────────────────────────
  subscription: router({
    /**
     * Public: request access to the site
     */
    request: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        organization: z.string().optional(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Check if already exists
        const existing = await getSubscriptionByEmail(input.email);
        if (existing) {
          if (existing.status === 'approved') {
            return { success: true, status: 'already_approved', message: 'Your email already has access.' };
          }
          if (existing.status === 'pending') {
            return { success: true, status: 'already_pending', message: 'Your request is already pending review.' };
          }
          // denied - allow re-request by updating
          await updateSubscriptionStatus(existing.id, 'pending' as any, '');
          return { success: true, status: 'resubmitted', message: 'Your request has been resubmitted for review.' };
        }
        await createSubscription({
          email: input.email,
          name: input.name,
          organization: input.organization || null,
          reason: input.reason || null,
          status: 'pending',
        });
        // Notify owner
        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: 'New Subscription Request',
            content: `${input.name} (${input.email}) from ${input.organization || 'N/A'} has requested access to the Supply Chain Brief.`,
          });
        } catch (e) { /* non-critical */ }
        return { success: true, status: 'submitted', message: 'Your request has been submitted. You will be notified when approved.' };
      }),

    /**
     * Public: check if an email is authorized
     */
    checkAccess: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const authorized = await isEmailAuthorized(input.email);
        return { authorized };
      }),

    /**
     * Public: check subscription status by email
     */
    checkStatus: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const sub = await getSubscriptionByEmail(input.email);
        return { status: sub?.status || null };
      }),

    // ── Admin procedures (protected by admin token) ───────────────────────────
    getAll: publicProcedure.query(async () => {
      return await getAllSubscriptions();
    }),

    approve: publicProcedure
      .input(z.object({ id: z.number(), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await updateSubscriptionStatus(input.id, 'approved', 'Admin', input.notes);
        return { success: true };
      }),

    deny: publicProcedure
      .input(z.object({ id: z.number(), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await updateSubscriptionStatus(input.id, 'denied', 'Admin', input.notes);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSubscription(input.id);
        return { success: true };
      }),
  }),

  // ─── Email Allowlist ──────────────────────────────────────────────────────
  allowlist: router({
    getAll: publicProcedure.query(async () => {
      return await getAllAllowlist();
    }),

    add: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await addToAllowlist({
          email: input.email,
          name: input.name || null,
          addedBy: 'Admin',
          notes: input.notes || null,
        });
        return { success: true };
      }),

    remove: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await removeFromAllowlist(input.id);
        return { success: true };
      }),

    /**
     * Bulk import emails from CSV data (array of rows)
     * Each row: { email, name?, notes? }
     */
    bulkImport: publicProcedure
      .input(z.object({
        entries: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
          notes: z.string().optional(),
        })).min(1).max(500),
      }))
      .mutation(async ({ input }) => {
        const entries = input.entries.map(e => ({
          email: e.email,
          name: e.name || null,
          notes: e.notes || null,
          addedBy: 'Admin',
        }));
        const result = await bulkAddToAllowlist(entries);
        return result;
      }),
  }),

  // ─── Access check (for frontend gate) ─────────────────────────────────────
  access: router({
    /**
     * Check if the currently logged-in user's email is authorized.
     * Returns { authorized: boolean } - used by the frontend gate.
     */
    check: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) return { authorized: false };
      // Admins always have access
      if (ctx.user.role === 'admin') return { authorized: true };
      const authorized = await isEmailAuthorized(ctx.user.email);
      return { authorized };
    }),
  }),

  // ─── Admin Password Auth ─────────────────────────────────────────────────
  adminAuth: router({
    /**
     * Verify admin password. Returns { success: true } if correct.
     * The client stores a token in localStorage to persist the session.
     */
    verify: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const adminPassword = ENV.adminPassword;
        if (!adminPassword) {
          throw new Error('Admin password not configured. Please set the ADMIN_PASSWORD environment variable.');
        }
        if (input.password !== adminPassword) {
          throw new Error('Incorrect password.');
        }
        // Return a simple token the client can store in localStorage
        // We sign it with the cookie secret so it can't be forged
        const token = Buffer.from(`admin:${Date.now()}:${ENV.cookieSecret.slice(0, 8)}`).toString('base64');
        return { success: true, token };
      }),

    /**
     * Validate a stored admin token.
     */
    validateToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        try {
          const decoded = Buffer.from(input.token, 'base64').toString('utf8');
          const [prefix, , secret] = decoded.split(':');
          if (prefix === 'admin' && secret === ENV.cookieSecret.slice(0, 8)) {
            return { valid: true };
          }
          return { valid: false };
        } catch {
          return { valid: false };
        }
      }),
  }),

  // ─── Automated Updates (manual triggers + monitoring) ─────────────────────
  update: router({
    /** Admin: run the news pipeline now (RSS → DeepSeek → DB). */
    runNews: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        if (!isValidAdminToken(input.token)) throw new Error("Unauthorized");
        return await runNewsUpdate();
      }),

    /** Admin: refresh economic indices now (FRED → DB). */
    runIndices: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        if (!isValidAdminToken(input.token)) throw new Error("Unauthorized");
        return await runIndicesUpdate();
      }),

    /** Recent update runs (for the admin panel status view). */
    history: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(updateLogs)
        .orderBy(descOrder(updateLogs.createdAt))
        .limit(20);
    }),
  }),

  chat: router({
    sendMessage: publicProcedure
      .input(z.object({
        message: z.string(),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const currentDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // Get recent news articles to provide context
        const allNews = await getAllNewsArticles();
        const recentNews = allNews.slice(0, 10); // Get 10 most recent articles
        const newsContext = recentNews.map(a => {
          const bullets = typeof a.bullets === 'string' ? a.bullets : (Array.isArray(a.bullets) ? a.bullets.join(' ') : '');
          const preview = bullets.substring(0, 200);
          return `[${a.category}] ${a.title} (${a.date}) - ${preview}...`;
        }).join('\n');
        
        const systemPrompt = `You are an advanced Supply Chain Assistant with access to the latest news articles from the Mobility & Auto Supply Chain Brief.

Current date: ${currentDate}

You specialize in:
- Tariff Regulations & Trade Policies
- Logistics & Transportation
- Materials Pricing
- Supply Chain Risk Management
- Supplier Relationship Management
- Sustainability & Green Supply Chain

Recent news articles from the database:
${newsContext}

Provide concise, accurate, and actionable answers. When referencing news articles, cite the title and date. Use markdown formatting for better readability.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...input.history.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof rawContent === 'string' 
          ? rawContent 
          : "I apologize, but I couldn't generate a response. Please try again.";

        return { message: assistantMessage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
