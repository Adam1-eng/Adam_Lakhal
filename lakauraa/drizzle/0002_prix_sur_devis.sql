-- Prix : seulement « À partir de 600 $ », le reste sur devis (mise à jour des contenus existants)
UPDATE "services" SET "price" = 'À partir de 600 $' WHERE "id" = 'vitrine';
--> statement-breakpoint
UPDATE "services" SET "price" = 'Sur devis' WHERE "id" IN ('pro', 'boutique', 'entretien');
--> statement-breakpoint
UPDATE "faqs" SET "answer" = 'Les sites web commencent à partir de 600 $ (avant taxes) pour une page complète. Pour un site plus grand, une boutique en ligne ou une application, le prix dépend du travail demandé : je vous prépare un devis gratuit et détaillé. La maquette est toujours gratuite.' WHERE "question" = 'Combien coûte la création d’un site web ?';
--> statement-breakpoint
UPDATE "faqs" SET "answer" = replace("answer", 'avec le forfait Entretien à 40 $ par mois', 'avec le forfait Entretien (sur devis)');
--> statement-breakpoint
UPDATE "faqs" SET "answer" = replace("answer", 'dans la soumission', 'dans le devis');
